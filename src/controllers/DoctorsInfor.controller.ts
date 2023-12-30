import { DoctorsInforInputCreate, DoctorsInforInputUpdate } from "@/schema";
import { DoctorsInforService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class DoctorsInforController {
	create = async (req: Request<{}, {}, DoctorsInforInputCreate>, res: Response) => {
		const response = await DoctorsInforService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await DoctorsInforService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<DoctorsInforInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await DoctorsInforService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<DoctorsInforInputUpdate["params"], {}, DoctorsInforInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await DoctorsInforService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<DoctorsInforInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await DoctorsInforService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new DoctorsInforController();