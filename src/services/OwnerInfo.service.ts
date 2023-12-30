import { OwnerInfo, OwnerInfoModel } from "@/models";
import { OwnerInfoInputCreate, OwnerInfoInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";import { ObjectType } from "types";

class OwnerInfoService {
	static create = async (data: OwnerInfoInputCreate) => {
		return await OwnerInfoModel.create(data);
	};

	static update = async (data: OwnerInfoInputUpdate["body"], id: number) => {
		let OwnerInfo: OwnerInfo | boolean;

		if (!(await OwnerInfoModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await OwnerInfoModel.findOne<OwnerInfo>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: {}) => {
		return await OwnerInfoModel.findAll<OwnerInfo>(filters);
	};

	static findOne = async (conditions: ObjectType<OwnerInfo>) => {
		return await OwnerInfoModel.findOne<OwnerInfo>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await OwnerInfoModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default OwnerInfoService;
