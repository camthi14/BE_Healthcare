import {
  AddPrescriptionDetailsInput,
  GetByExamCardIdQuery,
  GetByExamCardIdQueryV2,
  PrescriptionInputCreate,
  PrescriptionInputUpdate,
  ReceivePrescriptionInput,
} from "@/schema";
import { PrescriptionService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class PrescriptionController {
  create = async (req: Request<{}, {}, PrescriptionInputCreate>, res: Response) => {
    const response = await PrescriptionService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  addPrescriptionDetails = async (
    req: Request<{}, {}, AddPrescriptionDetailsInput>,
    res: Response
  ) => {
    const response = await PrescriptionService.addPrescriptionDetails(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await PrescriptionService.getAll(filters, options);
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

  getById = async (req: Request<PrescriptionInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await PrescriptionService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getByExamCardId = async (req: Request<{}, {}, {}, GetByExamCardIdQuery>, res: Response) => {
    const response = await PrescriptionService.getByExamCardId(req.query);
    return new OKResponse({
      message: `Lấy dữ liệu thành công.`,
      metadata: response,
    }).send(res);
  };

  getByExaminationCardId = async (
    req: Request<{}, {}, {}, GetByExamCardIdQueryV2>,
    res: Response
  ) => {
    const response = await PrescriptionService.getByExaminationCardId(req.query);
    return new OKResponse({
      message: `Lấy dữ liệu thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<PrescriptionInputUpdate["params"], {}, PrescriptionInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await PrescriptionService.update(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<PrescriptionInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await PrescriptionService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  receivePrescription = async (req: Request<{}, {}, ReceivePrescriptionInput>, res: Response) => {
    const response = await PrescriptionService.receivePrescription(req.body);
    return new OKResponse({
      message: `Nhận thuốc thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new PrescriptionController();
