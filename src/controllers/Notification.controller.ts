import { NotificationInputCreate, NotificationInputUpdate } from "@/schema";
import { NotificationService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class NotificationController {
	create = async (req: Request<{}, {}, NotificationInputCreate>, res: Response) => {
		const response = await NotificationService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const { filters, options } = handleFilterQuery(req);
		const response = await NotificationService.getAll(filters, options);
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

	getById = async (req: Request<NotificationInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await NotificationService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<NotificationInputUpdate["params"], {}, NotificationInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await NotificationService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<NotificationInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await NotificationService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new NotificationController();