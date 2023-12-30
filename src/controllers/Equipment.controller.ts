import { CommonRequest } from "@/helpers";
import { EquipmentInputCreate, EquipmentInputUpdate } from "@/schema";
import { EquipmentService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class EquipmentController {
  create = async (req: CommonRequest<{}, {}, EquipmentInputCreate>, res: Response) => {
    const photo = req.imageId as string;

    const response = await EquipmentService.create({ ...req.body, photo: photo });
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await EquipmentService.getAll(filters, options);
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

  getById = async (req: Request<EquipmentInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EquipmentService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<EquipmentInputUpdate["params"], {}, EquipmentInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const photo = req.imageId as string;

    const response = await EquipmentService.update({ ...req.body, photo: photo }, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<EquipmentInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EquipmentService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new EquipmentController();
