import { CommonRequest } from "@/helpers";
import { GetDoctorQuery, SpecialistInputCreate, SpecialistInputUpdate } from "@/schema";
import { SpecialistService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class SpecialistController {
  create = async (req: CommonRequest<{}, {}, SpecialistInputCreate>, res: Response) => {
    const photo = req.imageId as string;
    const response = await SpecialistService.create({ ...req.body, photo: photo });
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await SpecialistService.getAll(filters, options);
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

  getById = async (req: Request<SpecialistInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await SpecialistService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getDoctor = async (req: Request<{}, {}, {}, GetDoctorQuery>, res: Response) => {
    const response = await SpecialistService.getDoctor(req.query);
    return new OKResponse({
      message: `Lấy lịch phòng khám theo chuyên khoa thành công`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<SpecialistInputUpdate["params"], {}, SpecialistInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const photo = req.imageId as string;
    const response = await SpecialistService.update({ ...req.body, photo: photo }, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<SpecialistInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await SpecialistService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new SpecialistController();
