import { TokenPairInputCreate, TokenPairInputUpdate } from "@/schema";
import { TokenPairService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class TokenPairController {
	create = async (req: Request<{}, {}, TokenPairInputCreate>, res: Response) => {
		const response = await TokenPairService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await TokenPairService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<TokenPairInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await TokenPairService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<TokenPairInputUpdate["params"], {}, TokenPairInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await TokenPairService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<TokenPairInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await TokenPairService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new TokenPairController();