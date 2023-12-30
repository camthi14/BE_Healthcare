import { ApiKeyInputCreate, ApiKeyInputUpdate } from "@/schema";
import { ApiKeyService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class ApiKeyController {
	create = async (req: Request<{}, {}, ApiKeyInputCreate>, res: Response) => {
		const response = await ApiKeyService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await ApiKeyService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<ApiKeyInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await ApiKeyService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<ApiKeyInputUpdate["params"], {}, ApiKeyInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await ApiKeyService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<ApiKeyInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await ApiKeyService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new ApiKeyController();