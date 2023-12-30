import {
  REFRESH_TOKEN_OR_USER_UN_AUTHORIZATION,
  SOMETHING_WRONG_HAPPEN_REFRESH_TOKEN,
  USER_NOT_FOUND,
} from "@/constants";
import { Transaction } from "@/lib";
import {
  Booking,
  BookingModel,
  Patient,
  PatientInfo,
  PatientInfoModel,
  PatientModel,
  PatientType,
} from "@/models";
import AuthModel from "@/models/Auth.model";
import {
  AddRelationshipInput,
  GetHistoryExaminationQuery,
  PatientChangePasswordInput,
  PatientInputRegister,
  PatientInputUpdateProfile,
  PatientLoginMobileInput,
  PatientRegisterDesktopInput,
} from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
  compareHashPassword,
  createTokenPair,
  dateTimeSql,
  generateJWT,
  generateOTP,
  generateUUID,
  getDisplayName,
  getInfoData,
  hashPassword,
  verifyJWT,
} from "@/utils";
import { env } from "config";
import dayjs from "dayjs";
import { ObjectType, Pagination, RefreshTokenProps } from "types";
import ApiKeyService from "./ApiKey.service";
import ExaminationCardService from "./ExaminationCard.service";
import HourObjectService from "./HourObject.service";
import PatientTypeService from "./PatientType.service";
import RefreshTokensUseService from "./RefreshTokensUse.service";
import TokenPairService from "./TokenPair.service";
import { removeImage, resultUrlImage } from "@/lib/cloudinary.lib";

class PatientService extends AuthModel {
  static createPatientNew = async (data: PatientRegisterDesktopInput) => {
    const phoneNumberExist = await PatientService.findOne({ phone_number: data.phone_number });

    if (phoneNumberExist) {
      throw new ConflictRequestError("Số điện thoại đã tồn tại.");
    }

    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    const uuid = generateUUID("PID");

    const { first_name, last_name, phone_number, patient_type_id, address, gender, birth_date } =
      data;
    const display_name = getDisplayName(first_name, last_name);
    const hashPass = await hashPassword("12345");

    try {
      await connect.beginTransaction();

      await Promise.all([
        transaction.create<Patient>({
          data: {
            id: uuid,
            display_name,
            email: "",
            password: hashPass,
            phone_number,
            patient_type_id: +patient_type_id,
          },
          pool: connect,
          table: PatientModel.getTable,
        }),
        transaction.create<PatientInfo>({
          data: {
            first_name,
            last_name,
            address,
            gender,
            birth_date,
            patient_id: uuid,
          },
          pool: connect,
          table: PatientInfoModel.getTable,
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
   * 1. Find phone number exist
   * 2. Generate uuid
   * 3. Generate otp
   * 4. Hash otp to jwt with secureKey is apiKey
   * 5. Create patient
   * 6. Create API Key for patient
   * 7. Send otp
   * 8. Return Complete
   * @param data
   * @returns
   */
  static create = async (data: PatientInputRegister, ipAddress: string) => {
    const { first_name, last_name, phone_number, password, birth_date } = data;

    const [phoneNumberExist, patientDefault, _passHash] = await Promise.all([
      PatientService.findOne({ phone_number: data.phone_number }),
      PatientTypeService.findOne({ is_default: 1 }),
      hashPassword(password),
    ]);

    if (phoneNumberExist) {
      throw new ConflictRequestError("Số điện thoại đã tồn tại.");
    }

    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();

      const uuid = generateUUID("PID");

      const display_name = getDisplayName(first_name, last_name);

      await transaction.create<Patient>({
        data: {
          id: uuid,
          display_name,
          email: "",
          password: _passHash,
          phone_number,
          patient_type_id: patientDefault ? patientDefault.id! : 1,
          status: "active",
        },
        pool: connect,
        table: PatientModel.getTable,
      });

      await transaction.create<PatientInfo>({
        data: {
          patient_id: uuid,
          first_name,
          last_name,
          birth_date: dateTimeSql(new Date(birth_date)),
        },
        pool: connect,
        table: PatientInfoModel.getTable,
      });

      return uuid;
    } catch (error) {
      await connect.rollback();
      throw error;
    } finally {
      await connect.commit();
      connect.release();
      transaction.releaseConnection(connect);
    }
  };

  /**
   * @description
   * 1. Find phone number exist
   * 2. Generate uuid
   * 3. Generate otp
   * 4. Hash otp to jwt with secureKey is apiKey
   * 5. Create patient
   * 6. Create API Key for patient
   * 7. Send otp
   * 8. Return Complete
   * @param data
   * @returns
   */
  static addRelationship = async (data: AddRelationshipInput) => {
    const { first_name, last_name, phone_number, birth_date, gender, relationship, relatives_id } =
      data;

    const [phoneNumberExist, patientDefault, relationshipExists] = await Promise.all([
      PatientService.findOne({ phone_number: data.phone_number }),
      PatientTypeService.findOne({ is_default: 1 }),
      PatientService.findOne({ relationship, relatives_id }),
    ]);

    if (relationshipExists) {
      throw new ConflictRequestError("Thành viên này đã tồn tại trong  danh sách của bạn");
    }

    if (phoneNumberExist) {
      throw new ConflictRequestError("Số điện thoại đã tồn tại.");
    }

    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();

      const uuid = generateUUID("PID");

      const display_name = getDisplayName(first_name, last_name);

      await transaction.create<Patient>({
        data: {
          id: uuid,
          display_name,
          email: "",
          password: "",
          phone_number,
          patient_type_id: patientDefault ? patientDefault.id! : 1,
          status: "active",
          relationship,
          relatives_id,
        },
        pool: connect,
        table: PatientModel.getTable,
      });

      await transaction.create<PatientInfo>({
        data: {
          patient_id: uuid,
          first_name,
          last_name,
          birth_date: dateTimeSql(new Date(birth_date)),
          gender,
        },
        pool: connect,
        table: PatientInfoModel.getTable,
      });

      return uuid;
    } catch (error) {
      await connect.rollback();
      throw error;
    } finally {
      await connect.commit();
      connect.release();
      transaction.releaseConnection(connect);
    }
  };

  /**
   * @description
   * 1. Get patient and get api key by patientId
   * 2. Check patient was exist status `inactive`. => if true => return
   * 3. Verify otp by secure from api key
   * 4. If otp expirse => return required resend otp.
   * 5. Compare otp with otp in hash otp => If false => return
   * 6. Update status to `inactive`
   * 7. Complete => return next step update profile
   * @param patientId
   * @param otp
   */
  static verifyPhoneNunber = async (patientId: string, otp: string) => {
    const [patient, apiKey] = await Promise.all([
      PatientService.getById(patientId),
      ApiKeyService.findOne({ patient_id: patientId }),
    ]);

    if (!apiKey) throw new BadRequestError("Vui lòng đăng ký tài khoản.");

    if (patient.status === "inactive" || !patient.otp_token || patient.phone_verified_at)
      throw new BadRequestError("Vui lòng cập nhật thông tin để tiếp tục.");

    try {
      const decode = verifyJWT<{ otp: string }>(patient.otp_token, apiKey.key);
      if (otp !== decode.otp) throw new BadRequestError("Mã xác thực không chính xác.");
    } catch (error: any) {
      if (error.message === "jwt expired") {
        throw new BadRequestError("Mã xác thực đã hết hạn vui lòng gửi yêu cầu lại.");
      }

      throw error;
    }

    await PatientService.update(
      {
        status: "inactive",
        otp_token: null,
        phone_verified_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      },
      patient.id!
    );

    return true;
  };

  /**
   * @description
   * 1. Get patient and get api key by patientId
   * 2. Check patient was exist status `inactive`. => if true => return
   * 3. Generate otp
   * 4. Hash otp to jwt with secureKey is apiKey
   * 5. Update new otp
   * 6. Return send new otp.
   * @param patientId
   */
  static resendVerifyPhoneNumber = async (patientId: string) => {
    const [patient, apiKey] = await Promise.all([
      PatientService.getById(patientId),
      ApiKeyService.findOne({ patient_id: patientId }),
    ]);

    if (!apiKey) throw new BadRequestError("Vui lòng đăng ký tài khoản.");

    if (patient.status === "inactive" || !patient.otp_token || patient.phone_verified_at)
      throw new BadRequestError("Vui lòng cập nhật thông tin để tiếp tục.");

    const otp = generateOTP();
    const otpHash = generateJWT({
      payload: { otp },
      secureKey: apiKey.key,
      expiresIn: env.EXPIRES_IN_OTP_PATIENT,
    });

    await PatientService.update({ otp_token: otpHash }, patient.id!);

    return otp;
  };

  static update = async (data: Partial<Patient>, id: string) => {
    const updated = await PatientModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static updateProfile = async (data: PatientInputUpdateProfile["body"], id: string) => {
    const phoneNumberExists = await PatientService.findOne({ phone_number: data.phone_number });

    if (phoneNumberExists && phoneNumberExists.id !== id) {
      throw new ConflictRequestError(`Số điện thoại \`${data.phone_number}\` đã tồn tại`);
    }

    if (data.email) {
      const emailExists = await PatientService.findOne({ email: data.email });

      if (emailExists && emailExists.id! !== id) {
        throw new ConflictRequestError(`Địa chỉ email \`${data.email}\` đã tồn tại`);
      }
    }

    let { first_name, last_name, email, phone_number, ...others } = data;

    const display_name = getDisplayName(first_name, last_name);

    const dataUpdate = {
      display_name,
      phone_number,
      email,
    };

    if (!dataUpdate?.email) {
      delete dataUpdate.email;
    }

    await Promise.all([
      PatientService.update(dataUpdate, id),
      PatientInfoModel.update<Partial<PatientInfo>, PatientInfo>(
        {
          first_name,
          last_name,
          ...others,
        },
        id,
        "patient_id"
      ),
    ]);

    return true;
  };

  static getById = async (
    id: string
  ): Promise<Patient & { infoData: PatientInfo; patientType: PatientType }> => {
    const [data, infoData] = await Promise.all([
      PatientModel.findOne<Patient>(
        { id: id },
        "-password -email_verified_at -phone_verified_at -remember_token"
      ),
      PatientInfoModel.findOne<PatientInfo>({ patient_id: id }),
    ]);

    if (!data || !infoData) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const patientType = await PatientTypeService.getById(data.patient_type_id);

    return { ...data, photo: data.photo ? resultUrlImage(data.photo) : "", infoData, patientType };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await PatientModel.findAll<Patient>(filters, undefined, options);
    const total = await PatientModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    const response = await Promise.all(
      results.map(
        (row): Promise<Patient & { infoData: PatientInfo | null }> =>
          new Promise(async (resolve, reject) => {
            try {
              const infoData = await PatientInfoModel.findOne<PatientInfo>({
                patient_id: row.id,
              });

              resolve({ ...row, infoData: infoData || null });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Patient>, select?: string) => {
    return await PatientModel.findOne<Patient>(conditions, select);
  };

  static deleteById = async (id: string) => {
    await PatientInfoModel.delete<PatientInfo>({ patient_id: id });

    if (!(await PatientModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getHistoryExamination = async ({ patientId }: GetHistoryExaminationQuery) => {
    const bookingData = await BookingModel.findAll<Booking>(
      {
        patient_id: patientId,
        status: "completed",
      },
      undefined,
      { order: "date" }
    );

    if (!bookingData.length) return [];

    const examinationCardData = await Promise.all(
      bookingData.map(
        ({ id, reason, date, hour_id }) =>
          new Promise(async (resolve, reject) => {
            try {
              const examinationCard = await ExaminationCardService.findOne({
                booking_id: id,
              });

              const hour = await HourObjectService.getById(hour_id);

              resolve({ ...examinationCard, reason, date, hour });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return examinationCardData;
  };

  static loginWithPhoneNumber = async ({ password, phone_number }: PatientLoginMobileInput) => {
    const customer = await PatientService.findOne({ phone_number: phone_number });

    if (!customer) {
      throw new NotFoundRequestError("Số điện thoại không chính xác.");
    }

    if (customer.deleted_at) throw new ForbiddenRequestError("Số điện thoại đã bị xóa.", undefined);

    const comparePassword = await compareHashPassword(password, customer.password);

    if (!comparePassword) throw new BadRequestError("Mật khẩu không chính xác.");

    const tokens = await this.generateKeyPairSync(customer.id!, { patient_id: customer.id! });

    return {
      tokens,
      user: { id: customer.id! },
    };
  };

  /**
   * 1. Check refreshToken used?
   * 2. If true delete tokenPair return => Error Forbidden
   * 3. Check refreshToken and refreshToken in tokenPair
   * 4. If false return => Error Forbidden
   * 5. Find UserId exist ? => If false return Error Not Found User
   * 6. Generate new Token Pair and update refreshToken
   * 7. Complete Return tokens
   */
  static refreshToken = async ({
    refreshToken,
    tokenPair,
    userId,
  }: Omit<RefreshTokenProps, "type">) => {
    const refreshTokenUsed = await RefreshTokensUseService.findOne({ refresh_token: refreshToken });

    if (refreshTokenUsed) {
      await TokenPairService.deleteById(tokenPair.id!);
      throw new ForbiddenRequestError(
        `Something wrong happened! Try login again.`,
        undefined,
        SOMETHING_WRONG_HAPPEN_REFRESH_TOKEN
      );
    }

    if (tokenPair.refresh_token !== refreshToken) {
      throw new ForbiddenRequestError(
        `Invalid refreshToken or user not registered...`,
        undefined,
        REFRESH_TOKEN_OR_USER_UN_AUTHORIZATION
      );
    }

    const founderUser = await PatientService.getById(String(userId));

    if (!founderUser) {
      throw new NotFoundRequestError(`User not found. Try again`, undefined, USER_NOT_FOUND);
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
      user: getInfoData(founderUser, ["id", "display_name"]),
      tokens,
    };
  };

  static getRelationship = async (patientId: string) => {
    const [patients, relatives] = await Promise.all([
      PatientService.getById(patientId),
      PatientService.getAll({ relatives_id: patientId }, { order: "relationship" }),
    ]);

    const results = { ...patients, relatives: relatives.results };

    return results;
  };

  static changePassword = async (
    data: PatientChangePasswordInput["body"],
    patientId: PatientChangePasswordInput["params"]["id"]
  ) => {
    const userFounder = await PatientService.findOne({ id: patientId });

    if (!userFounder) {
      throw new NotFoundRequestError(`Không tìm thấy thông tin. Vui lòng thử lại`);
    }

    const comparePassword = await compareHashPassword(data.password, userFounder.password);

    if (!comparePassword) {
      throw new BadRequestError("Mật khẩu cũ không chính xác. Vui lòng thử lại!");
    }

    const securePassword = await hashPassword(data.newPassword);

    const updateUser = await PatientService.update({ password: securePassword }, userFounder.id!);

    if (!updateUser) {
      throw new BadRequestError(`Thay đổi mật khẩu không thành công. Thử lại sau.`);
    }

    return true;
  };

  static changePhoto = async (photo: string, patientId: string) => {
    const userFounder = await PatientService.findOne({ id: patientId });

    if (!userFounder) {
      throw new NotFoundRequestError(`Không tìm thấy thông tin. Vui lòng thử lại`);
    }

    if (userFounder?.photo) {
      await removeImage(userFounder.photo);
    }

    const updateUser = await PatientService.update({ photo: photo }, userFounder.id!);

    if (!updateUser) {
      throw new BadRequestError(`Thay đổi mật khẩu không thành công. Thử lại sau.`);
    }

    const user = await PatientService.getById(patientId);

    return user;
  };

  static logout = async (tokenPairId: number) => {
    await TokenPairService.deleteById(tokenPairId);
    return true;
  };
}

export default PatientService;
