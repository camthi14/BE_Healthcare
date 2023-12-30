import { CookiesDoctor, cookieOptions } from "@/constants";
import { CommonRequest } from "@/helpers/request.helper";
import {
  DoctorInputCreate,
  DoctorInputUpdate,
  DoctorInputUpdateProfile,
  GetDoctorIdsInput,
  GetPatientsQuery,
} from "@/schema";
import {
  AuthChangePasswordInput,
  AuthForgotPasswordInput,
  AuthInputLogin,
  AuthResetPasswordParams,
} from "@/schema/Auth.schema";
import { DoctorService } from "@/services";
import {
  BadRequestError,
  CreatedResponse,
  ForbiddenRequestError,
  OKResponse,
  handleFilterQuery,
} from "@/utils";
import { Request, Response } from "express";

class DoctorController {
  create = async (req: CommonRequest<{}, {}, DoctorInputCreate>, res: Response) => {
    const photo_public = req.imageId as string;
    const response = await DoctorService.create({ ...req.body, photo: photo_public });
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  login = async (req: Request<{}, {}, AuthInputLogin>, res: Response) => {
    const response = await DoctorService.login(req.body);

    const { tokens, user } = response;
    res.cookie(CookiesDoctor.REFRESH_TOKEN_DOCTOR, tokens.refreshToken, cookieOptions);
    res.cookie(CookiesDoctor.X_CLIENT_ID_DOCTOR, user.id, cookieOptions);

    return new OKResponse({
      message: `Đăng nhập thành công.`,
      metadata: tokens.accessToken,
    }).send(res);
  };

  refreshToken = async (req: CommonRequest<{}, {}, AuthInputLogin>, res: Response) => {
    const response = await DoctorService.refreshToken({
      tokenPair: req.tokenPair!,
      refreshToken: req.refreshToken!,
      userId: req.userId!,
    });

    const { tokens, user } = response;
    res.cookie(CookiesDoctor.REFRESH_TOKEN_DOCTOR, tokens.refreshToken, cookieOptions);
    res.cookie(CookiesDoctor.X_CLIENT_ID_DOCTOR, user.id, cookieOptions);

    return new OKResponse({
      message: `RefreshToken thành công.`,
      metadata: response.tokens,
    }).send(res);
  };

  forgotPassword = async (req: Request<{}, {}, AuthForgotPasswordInput>, res: Response) => {
    const response = await DoctorService.forgotPassword({
      type: "doctor",
      data: req.body,
    });

    return new OKResponse({
      message: "Vui lòng kiểm tra email để thay đổi mật khẩu.",
      metadata: response,
    }).send(res);
  };

  changePassword = async (
    req: CommonRequest<DoctorInputUpdate["params"], {}, AuthChangePasswordInput>,
    res: Response
  ) => {
    const userId = req.userId as string;
    const id = req.params.id;
    if (userId !== id) throw new ForbiddenRequestError(`Chỉ được sử dụng id = ${userId} của mình.`);

    const response = await DoctorService.changePassword({ userId, ...req.body });

    return new OKResponse({
      message: `Thay đổi mật khẩu thành công.`,
      metadata: response,
    }).send(res);
  };

  resetPassword = async (
    req: Request<AuthResetPasswordParams["params"], {}, AuthResetPasswordParams["body"]>,
    res: Response
  ) => {
    const userId = req.params.id;
    const token = req.params.token;
    const response = await DoctorService.resetPassword({
      data: req.body,
      token,
      userId,
    });

    return new OKResponse({
      message: `Đặt lại mật khẩu thành công. Bạn có thể đăng nhập mật khẩu mới.`,
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await DoctorService.getAll(filters, options);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response.results,
      options: {
        limit: options.limit,
        page: options.page,
        totalRows: response.total,
        totalPage: Math.ceil(response.total / options.limit),
      },
    }).send(res);
  };

  getById = async (req: Request<DoctorInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await DoctorService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getPatients = async (req: Request<{}, {}, {}, GetPatientsQuery>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);

    const response = await DoctorService.getPatients({ doctorId: req.query.doctorId }, options);

    return new OKResponse({
      message: `Lấy danh sách bệnh nhân theo mã bác sĩ = ${req.query.doctorId} thành công`,
      metadata: response.results,
      options: {
        limit: options.limit,
        page: options.page,
        totalRows: response.total,
        totalPage: Math.ceil(response.total / options.limit),
      },
    }).send(res);
  };

  getProfile = async (req: CommonRequest<DoctorInputUpdate["params"], {}, {}>, res: Response) => {
    const userId = req.userId as string;

    const response = await DoctorService.getById(userId);
    return new OKResponse({
      message: `Lấy dữ liệu theo userId = ${userId} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<DoctorInputUpdateProfile["params"], {}, DoctorInputUpdateProfile["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const photo_public = req.imageId as string;

    const response = await DoctorService.updateProfile({ ...req.body, photo: photo_public }, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  updateProfile = async (
    req: CommonRequest<DoctorInputUpdateProfile["params"], {}, DoctorInputUpdateProfile["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const photo_public = req.imageId as string;
    const response = await DoctorService.updateProfile({ ...req.body, photo: photo_public }, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<DoctorInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await DoctorService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getMultipleIDs = async (req: Request<{}, {}, GetDoctorIdsInput>, res: Response) => {
    const response = await DoctorService.getMultipleIDs(req.body);
    return new OKResponse({
      message: `Lấy dữ liệu doctorIds thành công`,
      metadata: response,
    }).send(res);
  };

  getSchedule = async (
    req: Request<{}, {}, {}, { doctorId: string; date: string }>,
    res: Response
  ) => {
    if (!req.query.date || !req.query.doctorId) {
      throw new BadRequestError(`Thiếu thông tin bác sĩ và ngày được chọn.`);
    }

    const response = await DoctorService.getSchedule(req.query.date, req.query.doctorId);

    return new OKResponse({
      message: `Lấy dữ liệu lịch khám thành công`,
      metadata: response,
    }).send(res);
  };

  logout = async (req: CommonRequest, res: Response) => {
    await DoctorService.logout(req.userId as string);

    res.clearCookie(CookiesDoctor.X_CLIENT_ID_DOCTOR);
    res.clearCookie(CookiesDoctor.REFRESH_TOKEN_DOCTOR);

    return new OKResponse({
      message: `Đăng xuất thành công.`,
      metadata: {},
    }).send(res);
  };
}

export default new DoctorController();
