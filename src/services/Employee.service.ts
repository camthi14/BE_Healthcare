import { Templates, sendEmail } from "@/helpers";
import { Transaction } from "@/lib";
import {
  Employee,
  EmployeeInfo,
  EmployeeInfoModel,
  EmployeeModel,
  Operation,
  OperationModel,
  TokenPair,
  TokenPairModel,
} from "@/models";
import AuthModel from "@/models/Auth.model";
import { EmployeeInputCreate, EmployeeInputUpdateProfile } from "@/schema";
import { AuthChangePasswordInput, AuthInputLogin } from "@/schema/Auth.schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  InternalServerRequestError,
  NotFoundRequestError,
  compareHashPassword,
  createTokenPair,
  generateTokenOTP,
  generateUUID,
  getDisplayName,
  getInfoData,
  hashPassword,
  verifyJWT,
} from "@/utils";
import { env } from "config";
import {
  ObjectType,
  Pagination,
  RefreshTokenProps,
  forgotPasswordProps,
  getProfile,
  resetPasswordProps,
} from "types";
import RefreshTokensUseService from "./RefreshTokensUse.service";
import TokenPairService from "./TokenPair.service";
import { removeImage, resultUrlImage } from "@/lib/cloudinary.lib";
import DepartmentService from "./Department.service";
import OperationService from "./Operation.service";

class EmployeeService extends AuthModel {
  /**
   * @description
   * 1. Find username exist
   * 2. Generate uuid
   * 3. Create employee
   * 4. Return complete
   * @param data
   * @returns
   */
  static create = async (data: EmployeeInputCreate & { photo?: string }) => {
    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();
      const [usernameExists, phoneNumberExists, emailExists] = await Promise.all([
        EmployeeService.findOne({ username: data.username }),
        EmployeeService.findOne({ phone_number: data.phone_number }),
        EmployeeService.findOne({ email: data.email }),
      ]);

      if (usernameExists) {
        throw new ConflictRequestError(`Tài khoản \`${data.username}\` đã tồn tại`);
      }

      if (phoneNumberExists) {
        throw new ConflictRequestError(`Số điện thoại \`${data.phone_number}\` đã tồn tại`);
      }
      if (emailExists) {
        throw new ConflictRequestError(`E-mail \`${data.email}\` đã tồn tại`);
      }

      const uuid = generateUUID("EID");
      const { first_name, last_name, email, username, phone_number, photo } = data;
      const display_name = getDisplayName(first_name, last_name);
      const password = await hashPassword(data.password);

      await Promise.all([
        transaction.create<Employee>({
          data: {
            id: uuid,
            display_name,
            username,
            email,
            phone_number,
            password,
            status: "active",
            photo: photo ?? null,
          },
          pool: connect,
          table: EmployeeModel.getTable,
        }),
        transaction.create<EmployeeInfo>({
          data: {
            first_name,
            last_name,
            employee_id: uuid,
          },
          pool: connect,
          table: EmployeeInfoModel.getTable,
        }),
        transaction.create<Operation>({
          data: {
            department_id: +data.department_id,
            position_id: +data.position_id,
            employee_id: uuid,
          },
          pool: connect,
          table: OperationModel.getTable,
        }),
      ]);

      return uuid;
    } catch (error) {
      console.log(`rollback`);
      await connect.rollback();
      throw error;
    } finally {
      console.log(`finally`);
      await connect.commit();
      connect.release();
      transaction.releaseConnection(connect);
    }
  };

  /**
   * @description
   * 1. Check username
   * 2. Check password
   * 3. Check isActive account
   * 4. Generate token: accessToken, refreshToken
   * 5. Create TokenPair from token
   * 6. Complete. Return Token
   * @param data
   */
  static login = async (data: AuthInputLogin) => {
    const user = await EmployeeModel.findOne<Employee>({ username: data.username });

    if (!user) {
      throw new BadRequestError("Người dùng không tồn tại!");
    }

    const comparePassword = await compareHashPassword(data.password, user.password);

    if (!comparePassword) {
      throw new BadRequestError("Mật khẩu không khớp!");
    }

    if (user.status !== "active") {
      throw new ForbiddenRequestError("Người dùng không được phép truy cập!");
    }

    const tokens = await this.generateKeyPairSync(user.id!, { employee_id: user.id! });

    return {
      user: getInfoData(user, ["id", "display_name"]),
      tokens,
    };
  };

  /**
   * @description refreshToken
   * 1. Check refreshToken used?
   * 2. If true delete tokenPair return => Error Forbidden
   * 3. Check refreshToken and refreshToken in tokenPair if false return => Error Forbidden
   * 4. Find UserId exist ? => If false return Error Not Found User
   * 5. Generate new Token Pair and update refreshToken
   * 6. Complete Return tokens
   * @param param0
   */
  static refreshToken = async ({
    tokenPair,
    refreshToken,
    userId,
  }: Omit<RefreshTokenProps, "type">) => {
    const refreshTokenUsed = await RefreshTokensUseService.findOne({
      refresh_token: refreshToken,
      key_id: tokenPair.id!,
    });

    if (refreshTokenUsed) {
      await TokenPairService.deleteById(tokenPair.id!);
      throw new ForbiddenRequestError("Đã xảy ra lỗi. Vui lòng đăng nhập lại.");
    }

    if (tokenPair.refresh_token !== refreshToken)
      throw new ForbiddenRequestError(
        "Giá trị RefreshToken không hợp lệ hoặc người dùng chưa đăng ký."
      );

    const findUser = await EmployeeService.findOne({ id: userId });
    if (!findUser) throw new NotFoundRequestError("Không tìm thấy người dùng.");

    const tokens = createTokenPair({
      payload: { id: userId },
      privateKey: tokenPair.private_key,
      publicKey: tokenPair.public_key,
    });

    await Promise.all([
      TokenPairService.update({ refresh_token: tokens.refreshToken }, tokenPair.id!),
      RefreshTokensUseService.create({ key_id: tokenPair.id!, refresh_token: refreshToken }),
    ]);

    return {
      user: getInfoData(findUser, ["id", "display_name"]),
      tokens,
    };
  };

  /**
   * @description forgotPassword
   * 1. Get user by username => Check user if false return NotFound
   * 2. Reset password exits => if true return check email
   * 3. Generate token reset password
   * 4. Create url reset password
   * 5. Hash token with JWT
   * 6. Update token reset password for user
   * 7. Send email
   * 8. Complete return check email
   * @param param0
   */
  static forgotPassword = async ({ data, type }: forgotPasswordProps) => {
    //1
    const userFind = await EmployeeService.findOne({ username: data.username });
    if (!userFind)
      throw new NotFoundRequestError("Không tìm thấy tài khoản. Vui lòng nhập đúng tài khoản.");

    if (userFind.email !== data.email) {
      throw new BadRequestError("Email không đúng. Vui lòng nhập lại");
    }
    //2
    if (userFind.remember_token)
      throw new ConflictRequestError(`Vui lòng kiểm tra email để có thể thay đổi mật khẩu.`);

    //3,4,5
    const { TOKEN, hashToken } = generateTokenOTP(userFind.id!, undefined);
    const URL_RESET_PASSWORD = `${env.CLIENT_ORIGIN_WEB}/resetPassword/${userFind.id}/${TOKEN}/${type}`;
    //6,7
    try {
      await Promise.all([
        EmployeeService.update({ remember_token: hashToken }, userFind.id!),
        sendEmail({
          subject: "Quên mật khẩu",
          html: Templates.forgotPassword({
            displayName: userFind.display_name,
            email: data.email,
            url: URL_RESET_PASSWORD,
          }),
          to: data.email,
        }),
      ]);
      //8
      return URL_RESET_PASSWORD;
    } catch (error: any) {
      await EmployeeService.update({ remember_token: null }, userFind.id!);
      throw new InternalServerRequestError(error.message);
    }
  };

  /**
   * 1. Get user by user id.
   * 2. Check token exists
   * 3. Check token expires
   * 4. Compare token hash with token
   * 5. hash new password.
   * 6. update new password and remove token
   * 7. Complete return true.
   */
  static resetPassword = async ({ data, token, userId }: resetPasswordProps) => {
    //1
    const userFind = await EmployeeService.findOne({ id: userId });
    if (!userFind)
      throw new NotFoundRequestError("Không tìm thấy tài khoản. Vui lòng nhập đúng tài khoản.");

    //2
    if (!userFind?.remember_token) {
      throw new ForbiddenRequestError(
        "Giao dịch của bạn đã hết hạn. Vui lòng gửi lại để thực hiện lại."
      );
    }
    //3,4
    try {
      const decode = verifyJWT<{ token: string }>(userFind?.remember_token, userFind.id + "");

      if (decode.token !== token) {
        await EmployeeService.update({ remember_token: null }, userId as string);
        throw new ForbiddenRequestError("Mã token không hợp lệ. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        await EmployeeService.update({ remember_token: null }, userId as string);
        throw new ForbiddenRequestError("Mã token đã hết hạn. Vui lòng thực hiện lại tác vụ");
      }
      throw error;
    }

    //5
    const securePassword = await hashPassword(data.password);

    const updateUser = await EmployeeService.update(
      { password: securePassword, remember_token: null },
      userId as string
    );

    if (!updateUser) {
      throw new BadRequestError("Thay đổi mật khẩu không thành công. Thử lại sau.");
    }

    return true;
  };

  /**
   * @description change password
   * 1. Get user by userId
   * 2. Compare password
   * 3. Hash new password
   * 4. update password
   * 5. complete return true
   * @param param0
   */
  static changePassword = async ({
    password,
    newPassword,
    userId,
  }: getProfile & AuthChangePasswordInput) => {
    const userFind = await EmployeeService.findOne({ id: userId });

    if (!userFind)
      throw new NotFoundRequestError("Không tìm thấy người dùng. Vui lòng truy cập lại.");

    const passwordCompare = await compareHashPassword(password, userFind.password);

    if (!passwordCompare)
      throw new BadRequestError("Mật khẩu cũ không chính xác. Vui lòng nhập lại.");

    const securePassword = await hashPassword(newPassword);

    const updateUser = await EmployeeService.update({ password: securePassword }, userFind.id + "");
    if (!updateUser) throw new BadRequestError(`Thay đổi mật khẩu không thành công. Thử lại sau.`);

    return true;
  };

  static update = async (data: Partial<Employee>, id: string) => {
    const updated = await EmployeeModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  /**
   * @description update profile
   * 1. Check username and phoneNumber exist
   * 2. Check email exist
   * 3. update profile
   * 4. return newData
   * @param data
   * @param id
   * @returns
   */
  static updateProfile = async (
    data: EmployeeInputUpdateProfile["body"] & { photo?: string },
    id: string
  ) => {
    const [usernameExists, phoneNumberExists] = await Promise.all([
      EmployeeService.findOne({ username: data.username }),
      EmployeeService.findOne({ phone_number: data.phone_number }),
    ]);

    if (usernameExists && usernameExists.id !== id) {
      throw new ConflictRequestError(`Tài khoản \`${data.username}\` đã tồn tại`);
    }

    if (phoneNumberExists && phoneNumberExists.id !== id) {
      throw new ConflictRequestError(`Tài khoản \`${data.phone_number}\` đã tồn tại`);
    }

    if (data.email) {
      const emailExists = await EmployeeService.findOne({ email: data.email });

      if (emailExists && emailExists.id! !== id) {
        throw new ConflictRequestError(`Địa chỉ email \`${data.email}\` đã tồn tại`);
      }
    }

    const response = await EmployeeService.getById(id);

    let {
      first_name,
      last_name,
      email,
      username,
      phone_number,
      photo,
      department_id,
      position_id,
      ...others
    } = data;
    const display_name = getDisplayName(first_name, last_name);

    const dataUpdate = { display_name, username, phone_number, email, photo };

    if (data?.photo && response.photo) {
      if (data?.photo !== response.photo) await removeImage(response.photo);
    } else {
      delete dataUpdate.photo;
    }

    await Promise.all([
      EmployeeService.update(dataUpdate, id),
      EmployeeInfoModel.update<Partial<EmployeeInfo>, EmployeeInfo>(
        {
          first_name,
          last_name,
          ...others,
        },
        id,
        "employee_id"
      ),
      OperationModel.update<Partial<Operation>, Operation>(
        { department_id: +department_id, position_id: +position_id },
        id,
        "employee_id"
      ),
    ]);

    return true;
  };

  static getById = async (id: string) => {
    const [data, infoData, operation] = await Promise.all([
      EmployeeModel.findOne<Employee>(
        { id: id },
        "-password -email_verified_at -phone_verified_at -remember_token"
      ),
      EmployeeInfoModel.findOne<EmployeeInfo>({ employee_id: id }),
      OperationService.getByEmployeeId(id),
    ]);

    if (!data || !infoData) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return { ...data, photo: data.photo ? resultUrlImage(data.photo) : null, infoData, operation };
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await EmployeeModel.findAll<Employee>(filters, "-password", options);
    const total = await EmployeeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = results.map((item) => ({
      ...item,
      photo: item.photo ? resultUrlImage(item.photo) : null,
    }));

    const response = await Promise.all(
      data.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const [infoData, operation] = await Promise.all([
                EmployeeInfoModel.findOne<EmployeeInfo>({
                  employee_id: row.id,
                }),
                OperationService.getByEmployeeId(row.id!),
              ]);
              resolve({ ...row, infoData, operation });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Employee>) => {
    return await EmployeeModel.findOne<Employee>(conditions);
  };

  static deleteById = async (id: string) => {
    await OperationModel.delete<Operation>({ employee_id: id });
    await EmployeeInfoModel.delete<EmployeeInfo>({ employee_id: id });

    if (!(await EmployeeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static logout = async (id: string) => {
    await TokenPairModel.delete<TokenPair>({ employee_id: id });
    return true;
  };
}

export default EmployeeService;
