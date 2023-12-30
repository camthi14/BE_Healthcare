import { PatientTypeInputCreate, PatientTypeInputUpdate } from "@/schema";
import { PatientTypeService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class PatientTypeController {
	create = async (req: Request<{}, {}, PatientTypeInputCreate>, res: Response) => {
		const response = await PatientTypeService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await PatientTypeService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<PatientTypeInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await PatientTypeService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<PatientTypeInputUpdate["params"], {}, PatientTypeInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await PatientTypeService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<PatientTypeInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await PatientTypeService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new PatientTypeController();