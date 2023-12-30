import { EmployeeInfoInputCreate, EmployeeInfoInputUpdate } from "@/schema";
import { EmployeeInfoService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class EmployeeInfoController {
	create = async (req: Request<{}, {}, EmployeeInfoInputCreate>, res: Response) => {
		const response = await EmployeeInfoService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await EmployeeInfoService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<EmployeeInfoInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await EmployeeInfoService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<EmployeeInfoInputUpdate["params"], {}, EmployeeInfoInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await EmployeeInfoService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<EmployeeInfoInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await EmployeeInfoService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new EmployeeInfoController();