import { RoleInputCreate, RoleInputUpdate } from "@/schema";
import { RoleService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class RoleController {
	create = async (req: Request<{}, {}, RoleInputCreate>, res: Response) => {
		const response = await RoleService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await RoleService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<RoleInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await RoleService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<RoleInputUpdate["params"], {}, RoleInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await RoleService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<RoleInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await RoleService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new RoleController();