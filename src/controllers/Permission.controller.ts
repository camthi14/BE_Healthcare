import { PermissionInputCreate, PermissionInputUpdate } from "@/schema";
import { PermissionService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class PermissionController {
	create = async (req: Request<{}, {}, PermissionInputCreate>, res: Response) => {
		const response = await PermissionService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await PermissionService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<PermissionInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await PermissionService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<PermissionInputUpdate["params"], {}, PermissionInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await PermissionService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<PermissionInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await PermissionService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new PermissionController();