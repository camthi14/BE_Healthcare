import { RolePermissionInputCreate, RolePermissionInputUpdate } from "@/schema";
import { RolePermissionService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class RolePermissionController {
	create = async (req: Request<{}, {}, RolePermissionInputCreate>, res: Response) => {
		const response = await RolePermissionService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await RolePermissionService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<RolePermissionInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await RolePermissionService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<RolePermissionInputUpdate["params"], {}, RolePermissionInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await RolePermissionService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<RolePermissionInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await RolePermissionService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new RolePermissionController();