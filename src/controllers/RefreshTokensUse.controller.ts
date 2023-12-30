import { RefreshTokensUseInputCreate, RefreshTokensUseInputUpdate } from "@/schema";
import { RefreshTokensUseService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class RefreshTokensUseController {
  create = async (req: Request<{}, {}, RefreshTokensUseInputCreate>, res: Response) => {
    // const response = await RefreshTokensUseService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: "" },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await RefreshTokensUseService.getAll(filters);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
      options: filters,
    }).send(res);
  };

  getById = async (req: Request<RefreshTokensUseInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RefreshTokensUseService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<RefreshTokensUseInputUpdate["params"], {}, RefreshTokensUseInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await RefreshTokensUseService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<RefreshTokensUseInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RefreshTokensUseService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new RefreshTokensUseController();
