import { LogInputCreate, LogInputUpdate } from "@/schema";
import { LogService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class LogController {
	create = async (req: Request<{}, {}, LogInputCreate>, res: Response) => {
		const response = await LogService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await LogService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<LogInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await LogService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<LogInputUpdate["params"], {}, LogInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await LogService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<LogInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await LogService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new LogController();