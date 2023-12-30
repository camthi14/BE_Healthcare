import { ServiceSubclinicalInputCreate, ServiceSubclinicalInputUpdate } from "@/schema";
import { ServiceSubclinicalService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class ServiceSubclinicalController {
	create = async (req: Request<{}, {}, ServiceSubclinicalInputCreate>, res: Response) => {
		const response = await ServiceSubclinicalService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const { filters, options } = handleFilterQuery(req);
		const response = await ServiceSubclinicalService.getAll(filters, options);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response.results,
			options: {
				limit: options.limit,
				page: options.page,
				totalRows: response.total,
				totalPage: Math.ceil(response.total / options.limit),
			},
		}).send(res);
	};

	getById = async (req: Request<ServiceSubclinicalInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await ServiceSubclinicalService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<ServiceSubclinicalInputUpdate["params"], {}, ServiceSubclinicalInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await ServiceSubclinicalService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<ServiceSubclinicalInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await ServiceSubclinicalService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new ServiceSubclinicalController();