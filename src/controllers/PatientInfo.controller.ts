import { PatientInfoInputCreate, PatientInfoInputUpdate } from "@/schema";
import { PatientInfoService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class PatientInfoController {
	create = async (req: Request<{}, {}, PatientInfoInputCreate>, res: Response) => {
		const response = await PatientInfoService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await PatientInfoService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<PatientInfoInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await PatientInfoService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<PatientInfoInputUpdate["params"], {}, PatientInfoInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await PatientInfoService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<PatientInfoInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await PatientInfoService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new PatientInfoController();