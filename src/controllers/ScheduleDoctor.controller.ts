import {
  DoctorCancelScheduleInput,
  GetByDoctorAndDateQuery,
  ScheduleDoctorCreateMultipleInput,
  ScheduleDoctorInputCreate,
  ScheduleDoctorInputUpdate,
} from "@/schema";
import { ScheduleDoctorService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class ScheduleDoctorController {
  createMultiple = async (
    req: Request<{}, {}, ScheduleDoctorCreateMultipleInput>,
    res: Response
  ) => {
    const response = await ScheduleDoctorService.createMultiple(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  create = async (req: Request<{}, {}, ScheduleDoctorInputCreate>, res: Response) => {
    const response = await ScheduleDoctorService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  doctorCancel = async (req: Request<{}, {}, DoctorCancelScheduleInput>, res: Response) => {
    const response = await ScheduleDoctorService.cancelDoctor(req.body);
    return new CreatedResponse({
      message: "Hủy lịch thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await ScheduleDoctorService.getAll(filters, options);
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

  getById = async (req: Request<ScheduleDoctorInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ScheduleDoctorService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<ScheduleDoctorInputUpdate["params"], {}, ScheduleDoctorInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await ScheduleDoctorService.update(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<ScheduleDoctorInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ScheduleDoctorService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getByDoctorAndDates = async (
    req: Request<{}, {}, {}, GetByDoctorAndDateQuery>,
    res: Response
  ) => {
    const response = await ScheduleDoctorService.getByDoctorAndDates(req.query);
    return new OKResponse({
      message: `Lấy lịch làm việc của bác sĩ thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new ScheduleDoctorController();
