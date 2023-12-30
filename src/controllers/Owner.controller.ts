import { CookiesOwner, cookieOptions } from "@/constants";
import { CommonRequest } from "@/helpers/request.helper";
import { OwnerInputCreate, OwnerInputUpdate, OwnerInputUpdateProfile } from "@/schema";
import {
  AuthChangePasswordInput,
  AuthForgotPasswordInput,
  AuthInputLogin,
  AuthResetPasswordParams,
} from "@/schema/Auth.schema";
import { OwnerService } from "@/services";
import { CreatedResponse, ForbiddenRequestError, OKResponse } from "@/utils";
import { Request, Response } from "express";

class OwnerController {
  create = async (req: Request<{}, {}, OwnerInputCreate>, res: Response) => {
    const response = await OwnerService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await OwnerService.getAll(filters);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
      options: filters,
    }).send(res);
  };

  login = async (req: Request<{}, {}, AuthInputLogin>, res: Response) => {
    const response = await OwnerService.login(req.body);

    const { tokens, user } = response;

    res.cookie(CookiesOwner.REFRESH_TOKEN_OWNER, tokens.refreshToken, cookieOptions);
    res.cookie(CookiesOwner.X_CLIENT_ID_OWNER, user.id, cookieOptions);
    res.cookie(CookiesOwner.X_API_KEY_OWNER, tokens.apiKey?.key, cookieOptions);

    return new OKResponse({
      message: "Đăng nhập thành công.",
      metadata: tokens.accessToken,
      options: {},
    }).send(res);
  };

  refreshToken = async (req: CommonRequest<{}, {}, AuthInputLogin>, res: Response) => {
    const response = await OwnerService.refreshToken({
      tokenPair: req.tokenPair!,
      refreshToken: req.refreshToken!,
      userId: req.userId!,
    });

    const { tokens, user } = response;

    res.cookie(CookiesOwner.REFRESH_TOKEN_OWNER, tokens.refreshToken, cookieOptions);
    res.cookie(CookiesOwner.X_CLIENT_ID_OWNER, user.id, cookieOptions);

    return new OKResponse({
      message: "RefreshToken thành công.",
      metadata: response.tokens,
      options: {},
    }).send(res);
  };

  forgotPassword = async (req: Request<{}, {}, AuthForgotPasswordInput>, res: Response) => {
    const response = await OwnerService.forgotPassword({ type: "owner", data: req.body });

    return new OKResponse({
      message: "Vui lòng kiểm tra email để thay đổi mật khẩu.",
      metadata: response,
    }).send(res);
  };

  resetPassword = async (
    req: Request<AuthResetPasswordParams["params"], {}, AuthResetPasswordParams["body"]>,
    res: Response
  ) => {
    const userId = req.params.id;
    const token = req.params.token;
    const response = await OwnerService.resetPassword({ data: req.body, token, userId });

    return new OKResponse({
      message: `Đặt lại mật khẩu thành công. Bạn có thể đăng nhập mật khẩu mới.`,
      metadata: response,
    }).send(res);
  };

  changePassword = async (
    req: CommonRequest<OwnerInputUpdate["params"], {}, AuthChangePasswordInput>,
    res: Response
  ) => {
    const userId = req.userId as number;
    const id = req.params.id;

    if (userId !== +id)
      throw new ForbiddenRequestError(`Chỉ được sử dụng id = ${userId} của mình.`);

    const response = await OwnerService.changePassword({ userId, ...req.body });

    return new OKResponse({
      message: `Thay đổi mật khẩu thành công.`,
      metadata: response,
    }).send(res);
  };

  getById = async (req: Request<OwnerInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await OwnerService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getProfile = async (req: CommonRequest<OwnerInputUpdate["params"], {}, {}>, res: Response) => {
    const userId = req.userId as number;

    const response = await OwnerService.getById(userId);
    return new OKResponse({
      message: `Lấy dữ liệu theo userId = ${userId} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<OwnerInputUpdate["params"], {}, OwnerInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await OwnerService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  updateProfile = async (
    req: Request<OwnerInputUpdateProfile["params"], {}, OwnerInputUpdateProfile["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await OwnerService.updateProfile(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<OwnerInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await OwnerService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  logout = async (req: CommonRequest, res: Response) => {
    await OwnerService.logout(req.userId as number);

    res.clearCookie(CookiesOwner.X_CLIENT_ID_OWNER);
    res.clearCookie(CookiesOwner.REFRESH_TOKEN_OWNER);

    return new OKResponse({
      message: `Đăng xuất thành công.`,
      metadata: {},
    }).send(res);
  };
}

export default new OwnerController();
