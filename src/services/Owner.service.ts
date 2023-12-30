import { Templates, sendEmail } from "@/helpers";
import { Transaction } from "@/lib";
import { Owner, OwnerInfo, OwnerInfoModel, OwnerModel, TokenPair, TokenPairModel } from "@/models";
import AuthModel from "@/models/Auth.model";
import { OwnerInputCreate, OwnerInputUpdateProfile } from "@/schema";
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
  getDisplayName,
  getInfoData,
  hashPassword,
  verifyJWT,
} from "@/utils";
import { env } from "config";
import {
  ObjectType,
  RefreshTokenProps,
  forgotPasswordProps,
  getProfile,
  resetPasswordProps,
} from "types";
import RefreshTokensUseService from "./RefreshTokensUse.service";
import TokenPairService from "./TokenPair.service";

class OwnerService extends AuthModel {
  /**
   * @description
   * 1. Find username exist
   * 2. Generate uuid
   * 3. Create employee & employeeInfo
   * 4. Return complete
   * @param data
   * @returns
   */
  static create = async (data: OwnerInputCreate) => {
    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();
      const usernameExist = await OwnerService.findOne({ username: data.username });

      if (usernameExist) {
        throw new ConflictRequestError("Tên tài khoản của bạn đã tồn tại.");
      }

      const { first_name, last_name, username, email } = data;
      const display_name = getDisplayName(first_name, last_name);

      const response = await transaction.create<Owner>({
        data: {
          display_name,
          username,
          password: await hashPassword(data.password),
          email,
          status: "active",
        },
        pool: connect,
        table: OwnerModel.getTable,
      });

      const responseInfo = await transaction.create<OwnerInfo>({
        data: {
          first_name,
          last_name,
          owner_id: response,
        },
        pool: connect,
        table: OwnerInfoModel.getTable,
      });

      return true;
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
    const user = await OwnerModel.findOne<Owner>({ username: data.username });

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

    const tokens = await this.generateKeyPairSync(user.id!, { owner_id: user.id! });

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

    if (tokenPair.refresh_token !== refreshToken) {
      throw new ForbiddenRequestError(
        "Giá trị RefreshToken không hợp lệ hoặc người dùng chưa đăng ký."
      );
    }

    const findUser = await OwnerService.findOne({ id: userId });
    if (!findUser) {
      throw new NotFoundRequestError("Không tìm thấy người dùng.");
    }

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
    const userFind = await OwnerService.findOne({ username: data.username });
    if (!userFind) {
      throw new NotFoundRequestError("Không tìm thấy tài khoản. Vui lòng nhập đúng tài khoản.");
    }
    if (userFind.email !== data.email) {
      throw new BadRequestError("Email không đúng. Vui lòng nhập lại");
    }

    //2
    if (userFind.remember_token) {
      throw new ConflictRequestError("Vui lòng kiểm tra email để có thể thay đổi mật khẩu.");
    }
    //3,4,5
    const { TOKEN, hashToken } = generateTokenOTP(userFind.id!.toString(), undefined);
    const URL_RESET_PASSWORD = `${env.CLIENT_ORIGIN_WEB}/resetPassword/${userFind.id}/${TOKEN}/${type}`;
    //6,7
    try {
      await Promise.all([
        OwnerService.update({ remember_token: hashToken }, userFind.id!),
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
      await OwnerService.update({ remember_token: null }, userFind.id!);
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
    const userFind = await OwnerService.findOne({ id: userId });
    if (!userFind) {
      throw new NotFoundRequestError("Không tìm thấy người dùng.");
    }

    if (!userFind?.remember_token) {
      throw new ForbiddenRequestError(
        "Giao dịch của bạn đã hết hạn. Vui lòng gửi lại để thực hiện lại."
      );
    }

    try {
      const decode = verifyJWT<{ token: string }>(userFind?.remember_token, userFind.id + "");
      if (decode.token !== token) {
        await OwnerService.update({ remember_token: null }, +userId);
        throw new ForbiddenRequestError("Mã token không hợp lệ. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        await OwnerService.update({ remember_token: null }, +userId);
        throw new ForbiddenRequestError("Mã token đã hết hạn. Vui lòng thực hiện lại tác vụ");
      }
      throw error;
    }

    const securePassword = await hashPassword(data.password);

    const updateUser = await OwnerService.update(
      { password: securePassword, remember_token: null },
      +userId
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
    const userFind = await OwnerService.findOne({ id: userId });

    if (!userFind)
      throw new NotFoundRequestError("Không tìm thấy người dùng. Vui lòng truy cập lại.");

    const passwordCompare = await compareHashPassword(password, userFind.password);

    if (!passwordCompare)
      throw new BadRequestError("Mật khẩu cũ không chính xác. Vui lòng nhập lại.");

    const securePassword = await hashPassword(newPassword);

    const updateUser = await OwnerService.update({ password: securePassword }, userFind.id!);
    if (!updateUser) throw new BadRequestError(`Thay đổi mật khẩu không thành công. Thử lại sau.`);

    return true;
  };

  static update = async (data: Partial<Owner>, id: number) => {
    const updated = await OwnerModel.update(data, id);

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
  static updateProfile = async (data: OwnerInputUpdateProfile["body"], id: number) => {
    const [usernameExists, phoneNumberExists] = await Promise.all([
      OwnerService.findOne({ username: data.username }),
      OwnerService.findOne({ phone_number: data.phone_number }),
    ]);

    if (usernameExists && usernameExists.id! !== id) {
      throw new ConflictRequestError(`Tài khoản \`${data.username}\` đã tồn tại`);
    }

    if (phoneNumberExists && phoneNumberExists.id! !== id) {
      throw new ConflictRequestError(`Số điện thoại \`${data.phone_number}\` đã tồn tại`);
    }

    if (data.email) {
      const emailExists = await OwnerService.findOne({ email: data.email });

      if (emailExists && emailExists.id! !== id) {
        throw new ConflictRequestError(`Địa chỉ email \`${data.email}\` đã tồn tại`);
      }
    }

    const { first_name, last_name, username, phone_number, email, ...others } = data;

    const display_name = getDisplayName(first_name, last_name);

    await Promise.all([
      OwnerService.update({ display_name, username, phone_number, email }, id),
      OwnerInfoModel.update<Partial<OwnerInfo>, OwnerInfo>(
        {
          first_name,
          last_name,
          ...others,
        },
        id,
        "owner_id"
      ),
    ]);

    const updated = await OwnerService.getById(id);

    return updated;
  };

  static getById = async (id: number) => {
    const [data, infoData] = await Promise.all([
      OwnerModel.findOne<Owner>(
        { id: id },
        "-password -email_verified_at -phone_verified_at -remember_token -token_owner"
      ),
      OwnerInfoModel.findOne<OwnerInfo>({ owner_id: id }),
    ]);

    if (!data || !infoData) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return { ...data, infoData };
  };

  static getAll = async (filters: {}) => {
    return await OwnerModel.findAll<Owner>(
      filters,
      "-password -email_verified_at -phone_verified_at -remember_token -token_owner"
    );
  };

  static findOne = async (conditions: ObjectType<Owner>) => {
    return await OwnerModel.findOne<Owner>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await OwnerModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static logout = async (id: number) => {
    await TokenPairModel.delete<TokenPair>({ doctor_id: id });
    return true;
  };
}

export default OwnerService;
