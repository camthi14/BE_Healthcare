import { CommonRequest } from "@/helpers";
import { Patient } from "@/models";
import {
  AddRelationshipInput,
  GetHistoryExaminationQuery,
  PatientChangePasswordInput,
  PatientInputRegister,
  PatientInputUpdate,
  PatientInputUpdateProfile,
  PatientLoginMobileInput,
  PatientRegisterDesktopInput,
  PatientVerifyPhoneNumberInput,
} from "@/schema";
import { PatientService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class PatientController {
  create = async (req: Request<{}, {}, PatientInputRegister>, res: Response) => {
    const response = await PatientService.create(req.body, req.ip);
    return new CreatedResponse({
      message: "Vui lòng xác thực mã otp",
      metadata: response,
    }).send(res);
  };

  createPatientNew = async (req: Request<{}, {}, PatientRegisterDesktopInput>, res: Response) => {
    const response = await PatientService.createPatientNew(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công",
      metadata: response,
    }).send(res);
  };

  addRelationship = async (req: Request<{}, {}, AddRelationshipInput>, res: Response) => {
    const response = await PatientService.addRelationship(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await PatientService.getAll(filters, options);
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

  verifyPhoneNumber = async (
    req: Request<
      PatientVerifyPhoneNumberInput["params"],
      {},
      PatientVerifyPhoneNumberInput["body"]
    >,
    res: Response
  ) => {
    const patientId = req.params.patientId;
    await PatientService.verifyPhoneNunber(patientId, req.body.otp);
    return new OKResponse({
      message: "Xác thực thành công. Vui lòng cập nhập thông tin để tiếp tục.",
      metadata: {},
    }).send(res);
  };

  resendVerifyPhoneNumber = async (
    req: Request<PatientVerifyPhoneNumberInput["params"], {}, {}>,
    res: Response
  ) => {
    const patientId = req.params.patientId;
    const response = await PatientService.resendVerifyPhoneNumber(patientId);
    return new OKResponse({
      message: "Gửi mã xác nhận thành công. Vui lòng kiểm tra",
      metadata: response,
    }).send(res);
  };

  getById = async (req: Request<PatientInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await PatientService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getHistoryExamination = async (
    req: Request<{}, {}, {}, GetHistoryExaminationQuery>,
    res: Response
  ) => {
    const response = await PatientService.getHistoryExamination(req.query);
    return new OKResponse({
      message: `Lấy dữ liệu theo mã bác sĩ = ${req.query.patientId} thành công.`,
      metadata: response,
    }).send(res);
  };

  getProfile = async (req: CommonRequest<PatientInputUpdate["params"], {}, {}>, res: Response) => {
    const userId = req.userId as string;

    const response = await PatientService.getById(userId);
    return new OKResponse({
      message: `Lấy dữ liệu theo userId = ${userId} thành công.`,
      metadata: response,
    }).send(res);
  };

  refreshTokenMobile = async (req: CommonRequest, res: Response) => {
    // console.log(`check`, { ref: req.refreshToken, token: req.tokenPair, userID: req.userId });

    const response = await PatientService.refreshToken({
      refreshToken: req.refreshToken!,
      tokenPair: req.tokenPair!,
      userId: req.userId!,
    });

    return new OKResponse({
      message: "RefreshToken thành công.",
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<PatientInputUpdate["params"], {}, PatientInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await PatientService.update(req.body as unknown as Patient, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  updateProfile = async (
    req: Request<PatientInputUpdateProfile["params"], {}, PatientInputUpdateProfile["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await PatientService.updateProfile(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<PatientInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await PatientService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  loginWithPhoneNumber = async (req: Request<{}, {}, PatientLoginMobileInput>, res: Response) => {
    const response = await PatientService.loginWithPhoneNumber(req.body);

    req.session.userId = response.user.id;
    req.session.accessToken = response.tokens.accessToken;
    req.session.refreshToken = response.tokens.refreshToken;

    return new OKResponse({
      message: "Đăng nhập thành công.",
      metadata: response,
    }).send(res);
  };

  getRelationship = async (
    req: Request<{ patientId: string }, {}, PatientLoginMobileInput>,
    res: Response
  ) => {
    const response = await PatientService.getRelationship(req.params.patientId);

    return new OKResponse({
      message: "Đăng nhập thành công.",
      metadata: response,
    }).send(res);
  };

  changePassword = async (
    req: CommonRequest<
      PatientChangePasswordInput["params"],
      {},
      PatientChangePasswordInput["body"]
    >,
    res: Response
  ) => {
    const response = await PatientService.changePassword(req.body, req.params.id);

    return new OKResponse({
      message: "Lấy dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  changePhoto = async (
    req: CommonRequest<PatientChangePasswordInput["params"], {}, {}>,
    res: Response
  ) => {
    const response = await PatientService.changePhoto(req.imageId as string, req.params.id);

    return new OKResponse({
      message: "Thay đổi ảnh thành công.",
      metadata: response,
    }).send(res);
  };

  logoutMobile = async (req: CommonRequest, res: Response) => {
    const tokenPair = req.tokenPair!;

    const response = await PatientService.logout(tokenPair.id!);

    req.session.destroy((err) => {});

    return new OKResponse({
      message: `Đăng xuất thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new PatientController();
