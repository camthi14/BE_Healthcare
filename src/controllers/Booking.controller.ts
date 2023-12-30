import { CommonRequest } from "@/helpers";
import {
  BookingDesktopInput,
  BookingInputCreate,
  BookingInputUpdate,
  BookingMobileInput,
} from "@/schema";
import { BookingService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class BookingController {
  create = async (req: Request<{}, {}, BookingInputCreate>, res: Response) => {
    const response = await BookingService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  bookingDesktop = async (req: Request<{}, {}, BookingDesktopInput>, res: Response) => {
    const response = await BookingService.bookingDesktop(req.body);
    return new CreatedResponse({
      message: "Đặt lịch khám thành công",
      metadata: response,
    }).send(res);
  };

  getAllMobile = async (
    req: Request<{ patientId: string }, {}, BookingDesktopInput, { date?: string }>,
    res: Response
  ) => {
    const response = await BookingService.getAllMobile(req.params.patientId, req.query.date);
    return new CreatedResponse({
      message: "Lấy danh dách lịch sử đặt thành công",
      metadata: response,
    }).send(res);
  };

  bookingMobile = async (req: CommonRequest<{}, {}, BookingMobileInput>, res: Response) => {
    const { price, order, ...other } = req.body;

    const response = await BookingService.bookingMobile({
      ...other,
      price: Number(price),
      order: Number(order),
      images: req.imageId as string[],
    });
    return new CreatedResponse({
      message: "Đặt lịch khám thành công",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await BookingService.getAll(filters, options);
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

  getById = async (req: Request<BookingInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BookingService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getByHourId = async (req: Request<BookingInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BookingService.getByHourId(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<BookingInputUpdate["params"], {}, BookingInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await BookingService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<BookingInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BookingService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  cancel = async (req: Request<BookingInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BookingService.cancel(id);
    return new OKResponse({
      message: `Hủy lịch thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new BookingController();
