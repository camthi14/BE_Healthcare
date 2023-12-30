import { CookiesEmployee, cookieOptions } from "@/constants";
import { CommonRequest } from "@/helpers/request.helper";
import { EmployeeInputCreate, EmployeeInputUpdate, EmployeeInputUpdateProfile } from "@/schema";
import {
  AuthChangePasswordInput,
  AuthForgotPasswordInput,
  AuthInputLogin,
  AuthResetPasswordParams,
} from "@/schema/Auth.schema";
import { EmployeeService } from "@/services";
import { CreatedResponse, ForbiddenRequestError, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class EmployeeController {
  create = async (req: CommonRequest<{}, {}, EmployeeInputCreate>, res: Response) => {
    const photo_public = req.imageId as string;

    const response = await EmployeeService.create({ ...req.body, photo: photo_public });
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  login = async (req: Request<{}, {}, AuthInputLogin>, res: Response) => {
    const response = await EmployeeService.login(req.body);

    const { tokens, user } = response;
    res.cookie(CookiesEmployee.REFRESH_TOKEN_EMPLOYEE, tokens.refreshToken, cookieOptions);
    res.cookie(CookiesEmployee.X_CLIENT_ID_EMPLOYEE, user.id, cookieOptions);

    return new OKResponse({
      message: `Đăng nhập thành công.`,
      metadata: tokens.accessToken,
    }).send(res);
  };

  refreshToken = async (req: CommonRequest<{}, {}, AuthInputLogin>, res: Response) => {
    const response = await EmployeeService.refreshToken({
      tokenPair: req.tokenPair!,
      refreshToken: req.refreshToken!,
      userId: req.userId!,
    });

    const { tokens, user } = response;
    res.cookie(CookiesEmployee.REFRESH_TOKEN_EMPLOYEE, tokens.refreshToken, cookieOptions);
    res.cookie(CookiesEmployee.X_CLIENT_ID_EMPLOYEE, user.id, cookieOptions);

    return new OKResponse({
      message: `RefreshToken thành công.`,
      metadata: response.tokens,
    }).send(res);
  };

  forgotPassword = async (req: Request<{}, {}, AuthForgotPasswordInput>, res: Response) => {
    const response = await EmployeeService.forgotPassword({
      type: "employee",
      data: req.body,
    });

    return new OKResponse({
      message: "Vui lòng kiểm tra email để thay đổi mật khẩu.",
      metadata: response,
    }).send(res);
  };

  changePassword = async (
    req: CommonRequest<EmployeeInputUpdate["params"], {}, AuthChangePasswordInput>,
    res: Response
  ) => {
    const userId = req.userId as string;
    const id = req.params.id;
    if (userId !== id) throw new ForbiddenRequestError(`Chỉ được sử dụng id = ${userId} của mình.`);

    const response = await EmployeeService.changePassword({ userId, ...req.body });

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
    const response = await EmployeeService.resetPassword({
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
    const response = await EmployeeService.getAll(filters, options);
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

  getById = async (req: Request<EmployeeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EmployeeService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getProfile = async (req: CommonRequest<EmployeeInputUpdate["params"], {}, {}>, res: Response) => {
    const userId = req.userId;

    const response = await EmployeeService.getById(`${userId}`);
    return new OKResponse({
      message: `Lấy dữ liệu theo userId = ${userId} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<
      EmployeeInputUpdateProfile["params"],
      {},
      EmployeeInputUpdateProfile["body"]
    >,
    res: Response
  ) => {
    const id = req.params.id;
    const photo_public = req.imageId as string;
    const response = await EmployeeService.updateProfile({ ...req.body, photo: photo_public }, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  updateProfile = async (
    req: CommonRequest<
      EmployeeInputUpdateProfile["params"],
      {},
      EmployeeInputUpdateProfile["body"]
    >,
    res: Response
  ) => {
    const id = req.params.id;
    const photo_public = req.imageId as string;
    const response = await EmployeeService.updateProfile({ ...req.body, photo: photo_public }, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<EmployeeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EmployeeService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  logout = async (req: CommonRequest, res: Response) => {
    await EmployeeService.logout(req.userId as string);

    res.clearCookie(CookiesEmployee.X_CLIENT_ID_EMPLOYEE);
    res.clearCookie(CookiesEmployee.REFRESH_TOKEN_EMPLOYEE);

    return new OKResponse({
      message: `Đăng xuất thành công.`,
      metadata: {},
    }).send(res);
  };
}

export default new EmployeeController();
