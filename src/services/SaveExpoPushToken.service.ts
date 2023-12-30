import { SaveExpoPushToken, SaveExpoPushTokenModel } from "@/models";
import { SaveExpoPushTokenInputCreate, SaveExpoPushTokenInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class SaveExpoPushTokenService {
	static create = async (data: SaveExpoPushTokenInputCreate) => {
		return await SaveExpoPushTokenModel.create(data);
	};

	static update = async (data: SaveExpoPushTokenInputUpdate["body"], id: number) => {
		let SaveExpoPushToken: SaveExpoPushToken | boolean;

		if (!(await SaveExpoPushTokenModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await SaveExpoPushTokenModel.findOne<SaveExpoPushToken>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: Record<string, any>, options: Pagination) => {
		const results = await SaveExpoPushTokenModel.findAll<SaveExpoPushToken>(filters, undefined, options);
		const total = await SaveExpoPushTokenModel.count(filters);
		if (!results.length) return { results: [], total: 0 };
		return { results, total };
	};

	static findOne = async (conditions: ObjectType<SaveExpoPushToken>) => {
		return await SaveExpoPushTokenModel.findOne<SaveExpoPushToken>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await SaveExpoPushTokenModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default SaveExpoPushTokenService;
