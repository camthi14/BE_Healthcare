import { EquipmentType, EquipmentTypeModel } from "@/models";
import { EquipmentTypeInputCreate, EquipmentTypeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class EquipmentTypeService {
	static create = async (data: EquipmentTypeInputCreate) => {
		return await EquipmentTypeModel.create(data);
	};

	static update = async (data: EquipmentTypeInputUpdate["body"], id: number) => {
		let EquipmentType: EquipmentType | boolean;

		if (!(await EquipmentTypeModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await EquipmentTypeModel.findOne<EquipmentType>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: Record<string, any>, options: Pagination) => {
		const results = await EquipmentTypeModel.findAll<EquipmentType>(filters, undefined, options);
		const total = await EquipmentTypeModel.count(filters);
		if (!results.length) return { results: [], total: 0 };
		return { results, total };
	};

	static findOne = async (conditions: ObjectType<EquipmentType>) => {
		return await EquipmentTypeModel.findOne<EquipmentType>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await EquipmentTypeModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default EquipmentTypeService;
