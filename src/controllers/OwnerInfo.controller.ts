import { OwnerInfoInputCreate, OwnerInfoInputUpdate } from "@/schema";
import { OwnerInfoService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class OwnerInfoController {
	create = async (req: Request<{}, {}, OwnerInfoInputCreate>, res: Response) => {
		const response = await OwnerInfoService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await OwnerInfoService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<OwnerInfoInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await OwnerInfoService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<OwnerInfoInputUpdate["params"], {}, OwnerInfoInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await OwnerInfoService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<OwnerInfoInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await OwnerInfoService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new OwnerInfoController();