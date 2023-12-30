import { SessionsCheckup, SessionsCheckupModel } from "@/models";
import { SessionsCheckupInputCreate, SessionsCheckupInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class SessionsCheckupService {
	static create = async (data: SessionsCheckupInputCreate) => {
		return await SessionsCheckupModel.create(data);
	};

	static update = async (data: SessionsCheckupInputUpdate["body"], id: number) => {
		let SessionsCheckup: SessionsCheckup | boolean;

		if (!(await SessionsCheckupModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await SessionsCheckupModel.findOne<SessionsCheckup>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: Record<string, any>, options: Pagination) => {
		const results = await SessionsCheckupModel.findAll<SessionsCheckup>(filters, undefined, options);
		const total = await SessionsCheckupModel.count(filters);
		if (!results.length) return { results: [], total: 0 };
		return { results, total };
	};

	static findOne = async (conditions: ObjectType<SessionsCheckup>) => {
		return await SessionsCheckupModel.findOne<SessionsCheckup>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await SessionsCheckupModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default SessionsCheckupService;
