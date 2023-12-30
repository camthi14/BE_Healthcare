import { Templates, sendEmail } from "@/helpers";
import { Transaction } from "@/lib";
import { removeImage, resultUrlImage } from "@/lib/cloudinary.lib";
import {
  BookingModel,
  Doctor,
  DoctorModel,
  DoctorsInfor,
  DoctorsInforModel,
  Operation,
  OperationModel,
  TokenPair,
  TokenPairModel,
} from "@/models";
import AuthModel from "@/models/Auth.model";
import {
  DoctorInputCreate,
  DoctorInputUpdateProfile,
  GetDoctorIdsInput,
  GetPatientsQuery,
} from "@/schema";
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
  handleCompareTimeWithCurrentTime,
  hashPassword,
  parserBooleanSQL,
  verifyJWT,
} from "@/utils";
import { env } from "config";
import { format } from "mysql2";
import {
  ObjectType,
  Pagination,
  RefreshTokenProps,
  forgotPasswordProps,
  getProfile,
  resetPasswordProps,
} from "types";
import HourObjectService from "./HourObject.service";
import OperationService from "./Operation.service";
import PatientService from "./Patient.service";
import QualifiedDoctorService from "./QualifiedDoctor.service";
import RefreshTokensUseService from "./RefreshTokensUse.service";
import ScheduleDoctorService from "./ScheduleDoctor.service";
import SpecialistService from "./Specialist.service";
import TokenPairService from "./TokenPair.service";
import dayjs from "dayjs";

type ResponsePromise = Doctor & {
  infoData: Awaited<ReturnType<typeof DoctorsInforModel.findOne>>;
  operation: Awaited<ReturnType<typeof OperationService.getByDoctorId>>;
  specialty: Awaited<ReturnType<typeof SpecialistService.getById>>;
  qualificationData: Awaited<ReturnType<typeof QualifiedDoctorService.getById>>;
};

class DoctorService extends AuthModel {
  /**
   * @description
   * 1. Find username exits
   * 2. Generate uuid
   * 3. Create employee
   * 4. Return complete
   * @param data
   * @returns
   */
  static create = async (data: DoctorInputCreate & { photo?: string }) => {
    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();
      const [usernameExists, phoneNumberExists, emailExists] = await Promise.all([
        DoctorService.findOne({ username: data.username }),
        DoctorService.findOne({ phone_number: data.phone_number }),
        DoctorService.findOne({ email: data.email }),
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

      const uuid = generateUUID("DID");
      const {
        first_name,
        last_name,
        username,
        email,
        phone_number,
        photo,
        qualified_doctor_id,
        speciality_id,
      } = data;
      const display_name = getDisplayName(first_name, last_name);
      const password = await hashPassword(data.password);

      await Promise.all([
        transaction.create<Doctor>({
          data: {
            id: uuid,
            display_name,
            username,
            email,
            phone_number,
            password,
            qualified_doctor_id: +qualified_doctor_id,
            speciality_id: +speciality_id,
            status: "active",
            photo: photo ?? null,
          },
          pool: connect,
          table: DoctorModel.getTable,
        }),
        transaction.create<DoctorsInfor>({
          data: {
            first_name,
            last_name,
            doctor_id: uuid,
          },
          pool: connect,
          table: DoctorsInforModel.getTable,
        }),
        transaction.create<Operation>({
          data: {
            department_id: +data.department_id,
            position_id: +data.position_id,
            doctor_id: uuid,
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
    const user = await DoctorModel.findOne<Doctor>({ username: data.username });

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

    const tokens = await this.generateKeyPairSync(user.id!, { doctor_id: user.id! });

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

    const findUser = await DoctorService.findOne({ id: userId });
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
    const userFind = await DoctorService.findOne({ username: data.username });
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
        DoctorService.update({ remember_token: hashToken }, userFind.id!),
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
      await DoctorService.update({ remember_token: null }, userFind.id!);
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
    const userFind = await DoctorService.findOne({ id: userId });
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
        await DoctorService.update({ remember_token: null }, userId as string);
        throw new ForbiddenRequestError("Mã token không hợp lệ. Vui lòng thử lại.");
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        await DoctorService.update({ remember_token: null }, userId as string);
        throw new ForbiddenRequestError("Mã token đã hết hạn. Vui lòng thực hiện lại tác vụ");
      }
      throw error;
    }

    //5
    const securePassword = await hashPassword(data.password);

    const updateUser = await DoctorService.update(
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
    const userFind = await DoctorService.findOne({ id: userId });

    if (!userFind)
      throw new NotFoundRequestError("Không tìm thấy người dùng. Vui lòng truy cập lại.");

    const passwordCompare = await compareHashPassword(password, userFind.password);

    if (!passwordCompare)
      throw new BadRequestError("Mật khẩu cũ không chính xác. Vui lòng nhập lại.");

    const securePassword = await hashPassword(newPassword);

    const updateUser = await DoctorService.update({ password: securePassword }, userFind.id + "");
    if (!updateUser) throw new BadRequestError(`Thay đổi mật khẩu không thành công. Thử lại sau.`);

    return true;
  };

  static update = async (data: Partial<Doctor>, id: string) => {
    const updated = await DoctorModel.update(data, id);

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
    data: DoctorInputUpdateProfile["body"] & { photo?: string },
    id: string
  ) => {
    const [usernameExists, phoneNumberExists] = await Promise.all([
      DoctorService.findOne({ username: data.username }),
      DoctorService.findOne({ phone_number: data.phone_number }),
    ]);
    if (usernameExists && usernameExists.id !== id) {
      throw new ConflictRequestError(`Tài khoản \`${data.username}\` đã tồn tại`);
    }
    if (phoneNumberExists && phoneNumberExists.id !== id) {
      throw new ConflictRequestError(`Tài khoản \`${data.phone_number}\` đã tồn tại`);
    }
    if (data.email) {
      const emailExists = await DoctorService.findOne({ email: data.email });
      if (emailExists && emailExists.id! !== id) {
        throw new ConflictRequestError(`Địa chỉ email \`${data.email}\` đã tồn tại`);
      }
    }

    const response = await DoctorService.getById(id);

    let {
      first_name,
      last_name,
      email,
      username,
      phone_number,
      photo,
      qualified_doctor_id,
      speciality_id,
      department_id,
      position_id,
      ...others
    } = data;

    const display_name = getDisplayName(first_name, last_name);

    const dataUpdate = {
      display_name,
      username,
      phone_number,
      email,
      photo,
      qualified_doctor_id: +qualified_doctor_id,
      speciality_id: +speciality_id,
    };

    if (data?.photo && response.photo) {
      if (data?.photo !== response.photo) await removeImage(response.photo);
    } else {
      delete dataUpdate.photo;
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await Promise.all([
        transaction.update<Partial<Doctor>, Doctor>({
          data: dataUpdate,
          key: "id",
          pool: connection,
          table: DoctorModel.getTable,
          valueOfKey: id,
        }),
        transaction.update<Partial<DoctorsInfor>, DoctorsInfor>({
          data: {
            first_name,
            last_name,
            ...others,
          },
          key: "doctor_id",
          pool: connection,
          table: DoctorsInforModel.getTable,
          valueOfKey: id,
        }),
        !response.operation
          ? transaction.create<Operation>({
              data: {
                department_id: Number(department_id),
                position_id: Number(position_id),
                doctor_id: id,
              },
              pool: connection,
              table: OperationModel.getTable,
            })
          : transaction.update<Partial<Operation>, Partial<Operation>>({
              data: { department_id: Number(department_id), position_id: Number(position_id) },
              pool: connection,
              table: OperationModel.getTable,
              key: "id",
              valueOfKey: response.operation?.id!,
            }),
      ]);

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static getById = async (id: string) => {
    const [data, infoData, operation] = await Promise.all([
      DoctorModel.findOne<Doctor>(
        { id: id },
        "-password -email_verified_at -phone_verified_at -remember_token"
      ),
      DoctorsInforModel.findOne<DoctorsInfor>({ doctor_id: id }),
      OperationService.getByDoctorId(id),
    ]);

    if (!data || !infoData) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const [specialtyData, qualificationData] = await Promise.all([
      SpecialistService.getById(data.speciality_id),
      QualifiedDoctorService.getById(data.qualified_doctor_id),
    ]);

    return {
      ...data,
      photo: data.photo ? resultUrlImage(data.photo) : null,
      infoData,
      operation,
      specialtyData,
      qualificationData,
    };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await DoctorModel.findAll<Doctor>(filters, "-password", options);
    const total = await DoctorModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = results.map((item) => ({
      ...item,
      photo: item.photo ? resultUrlImage(item.photo) : null,
    }));

    const response = await Promise.all(
      data.map(
        (row): Promise<ResponsePromise> =>
          new Promise(async (resolve, reject) => {
            try {
              const [infoData, operation, specialty, qualificationData] = await Promise.all([
                DoctorsInforModel.findOne<DoctorsInfor>({
                  doctor_id: row.id,
                }),
                OperationService.getByDoctorId(row.id!),
                SpecialistService.getById(row.speciality_id),
                QualifiedDoctorService.getById(row.qualified_doctor_id),
              ]);
              resolve({ ...row, infoData, operation, specialty, qualificationData });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Doctor>) => {
    return await DoctorModel.findOne<Doctor>(conditions);
  };

  static deleteById = async (id: string) => {
    await OperationModel.delete<Operation>({ doctor_id: id });
    await DoctorsInforModel.delete<DoctorsInfor>({ doctor_id: id });

    if (!(await DoctorModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static logout = async (id: string) => {
    await TokenPairModel.delete<TokenPair>({ doctor_id: id });
    return true;
  };

  static getMultipleIDs = async ({ doctorIds }: GetDoctorIdsInput) => {
    let _doctorIds = doctorIds.split(",");

    if (_doctorIds.length < 1) {
      const response = await this.getById(doctorIds);
      return [response];
    }

    const sql = format("SELECT * FROM ?? WHERE id IN (?)", [DoctorModel.getTable, _doctorIds]);

    const response = await DoctorModel.query<Doctor>(sql);

    if (!response.length) return [];

    const results = await Promise.all(
      response.map(
        (r) =>
          new Promise(async (resolve, reject) => {
            try {
              const specialty = await SpecialistService.getById(r.speciality_id);
              const qualificationData = await QualifiedDoctorService.findOne({
                id: r.qualified_doctor_id,
              });
              resolve({
                ...r,
                photo: r.photo ? resultUrlImage(r.photo) : null,
                specialtyData: specialty,
                qualificationData: qualificationData ? qualificationData : null,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static getSchedule = async (date: string, doctorId: string) => {
    const response = await ScheduleDoctorService.findOne({ doctor_id: doctorId, date: date });

    // console.log(`response`, response);

    if (!response) return [];

    const { results } = await HourObjectService.getAll(
      { schedule_doctor_id: response.id },
      { order: "time_start,asc" }
    );

    // console.log(`results`, results);

    const today = dayjs(new Date(date)).isToday();

    let data = results
      .filter((h) => !h.is_remove)
      .filter((h) => !h.is_cancel)
      .map((h) => ({
        ...h,
        is_over_time: false,
      }));

    if (today) {
      data = data.map((t) => {
        const isOverTime = handleCompareTimeWithCurrentTime(t.time_start, t.time_end);
        return {
          ...t,
          is_over_time: isOverTime,
          is_remove: isOverTime,
        };
      });
    }

    return data;
  };

  static getPatients = async (
    { doctorId, ...filters }: GetPatientsQuery & Record<string, any>,
    options: Omit<Pagination, "order" | "groupBy">
  ) => {
    const response = await BookingModel.getPatients({
      doctorId,
      status: "completed",
      ...options,
    });

    const total = await BookingModel.count({
      doctor_id: doctorId,
      status: "completed",
      ...filters,
    });

    if (!response.length)
      return {
        results: [],
        total: 0,
      };

    const patientResults = await Promise.all(
      response.map(
        ({ patient_id, created_at }) =>
          new Promise(async (resolve, reject) => {
            try {
              const patient = await PatientService.getById(patient_id);
              resolve({
                ...patient,
                lastCurrent: created_at,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return {
      results: patientResults,
      total: total,
    };
  };
}

export default DoctorService;
