import { ApiKey, ApiKeyModel } from "@/models";
import { ApiKeyInputCreate, ApiKeyInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";import { ObjectType } from "types";

class ApiKeyService {
	static create = async (data: ApiKeyInputCreate) => {
		if (await ApiKeyModel.findOne<ApiKey>({ key: data.key })) {
			throw new ConflictRequestError("key đã tồn tại...");
		}

		return await ApiKeyModel.create(data);
	};

	static update = async (data: ApiKeyInputUpdate["body"], id: number) => {
		let ApiKey: ApiKey | boolean;

		ApiKey = await ApiKeyModel.findOne<ApiKey>({ key: data.key });

		if (ApiKey && ApiKey.id !== id) {
			throw new ConflictRequestError("key đã tồn tại...");
		}

		if (!(await ApiKeyModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await ApiKeyModel.findOne<ApiKey>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: {}) => {
		return await ApiKeyModel.findAll<ApiKey>(filters);
	};

	static findOne = async (conditions: ObjectType<ApiKey>) => {
		return await ApiKeyModel.findOne<ApiKey>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await ApiKeyModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default ApiKeyService;
