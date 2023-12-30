import {
  ConfirmExaminationInput,
  ExaminationCardInputCreate,
  ExaminationCardInputUpdate,
  GetExaminationCardDetailsQuery,
  GetPatientForDateQuery,
  GetRequiredQuery,
  PaymentInput,
  RequiredExaminationInput,
  ServiceExaminationCreateInput,
} from "@/schema";
import { ExaminationCardService } from "@/services";
import { BadRequestError, CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class ExaminationCardController {
  create = async (req: Request<{}, {}, ExaminationCardInputCreate>, res: Response) => {
    const response = await ExaminationCardService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  payment = async (req: Request<{}, {}, PaymentInput>, res: Response) => {
    const response = await ExaminationCardService.payment(req.body);
    return new OKResponse({
      message: "Thanh toán thành công",
      metadata: response,
    }).send(res);
  };

  confirmExamination = async (req: Request<{}, {}, ConfirmExaminationInput>, res: Response) => {
    const response = await ExaminationCardService.confirmExamination(req.body);
    return new OKResponse({
      message: "Xác nhận thành công",
      metadata: response,
    }).send(res);
  };

  requiredExaminationSubclinical = async (
    req: Request<{}, {}, RequiredExaminationInput>,
    res: Response
  ) => {
    const response = await ExaminationCardService.requiredExaminationSubclinical(req.body);
    return new OKResponse({
      message: "Yêu cầu thành công",
      metadata: response,
    }).send(res);
  };

  addServiceConfirm = async (
    req: Request<{}, {}, ServiceExaminationCreateInput>,
    res: Response
  ) => {
    const response = await ExaminationCardService.addServiceConfirm(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await ExaminationCardService.getAll(filters, options);
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

  getInformationPatient = async (
    req: Request<{}, {}, {}, { bookingId: string }>,
    res: Response
  ) => {
    if (!req.query.bookingId) {
      throw new BadRequestError("Thiếu dữ liệu `bookingId`");
    }
    const response = await ExaminationCardService.getInformationPatient(req.query.bookingId);

    return new OKResponse({
      message: "Lấy thông tin bệnh nhân thành công",
      metadata: response,
    }).send(res);
  };

  getExaminationByBookingId = async (
    req: Request<{ bookingId: string }, {}, {}>,
    res: Response
  ) => {
    const response = await ExaminationCardService.getExaminationByBookingId(req.params.bookingId);

    return new OKResponse({
      message: "Lấy thông tin khám bệnh thành công",
      metadata: response,
    }).send(res);
  };

  getPatientForDate = async (req: Request<{}, {}, {}, GetPatientForDateQuery>, res: Response) => {
    const response = await ExaminationCardService.getPatientForDate(req.query);

    return new OKResponse({
      message: "Lấy thông tin bệnh nhân thành công",
      metadata: response,
    }).send(res);
  };

  getExaminationForDate = async (
    req: Request<{}, {}, {}, GetPatientForDateQuery>,
    res: Response
  ) => {
    const response = await ExaminationCardService.getExaminationForDate(req.query);

    return new OKResponse({
      message: "Lấy thông tin chỉ định thành công",
      metadata: response,
    }).send(res);
  };

  getRequired = async (req: Request<{}, {}, {}, GetRequiredQuery>, res: Response) => {
    const response = await ExaminationCardService.getRequiredByDoctor(req.query);

    return new OKResponse({
      message: "Lấy thông tin yêu cầu thành công",
      metadata: response,
    }).send(res);
  };

  getExaminationCardDetails = async (
    req: Request<{}, {}, {}, GetExaminationCardDetailsQuery>,
    res: Response
  ) => {
    const response = await ExaminationCardService.getExaminationCardDetails(req.query);

    return new OKResponse({
      message: "Lấy thông tin yêu cầu thành công",
      metadata: response,
    }).send(res);
  };

  getById = async (req: Request<ExaminationCardInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ExaminationCardService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<ExaminationCardInputUpdate["params"], {}, ExaminationCardInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await ExaminationCardService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<ExaminationCardInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ExaminationCardService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new ExaminationCardController();
