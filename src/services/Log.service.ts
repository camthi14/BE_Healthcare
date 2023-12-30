import { Log, LogModel } from "@/models";
import { LogInputCreate, LogInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";import { ObjectType } from "types";

class LogService {
	static create = async (data: LogInputCreate) => {
		if (await LogModel.findOne<Log>({ filename: data.filename })) {
			throw new ConflictRequestError("filename đã tồn tại...");
		}

		return await LogModel.create(data);
	};

	static update = async (data: LogInputUpdate["body"], id: number) => {
		let Log: Log | boolean;

		Log = await LogModel.findOne<Log>({ filename: data.filename });

		if (Log && Log.id !== id) {
			throw new ConflictRequestError("filename đã tồn tại...");
		}

		if (!(await LogModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await LogModel.findOne<Log>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: {}) => {
		return await LogModel.findAll<Log>(filters);
	};

	static findOne = async (conditions: ObjectType<Log>) => {
		return await LogModel.findOne<Log>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await LogModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default LogService;
