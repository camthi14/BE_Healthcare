import { PatientType, PatientTypeModel } from "@/models";
import { PatientTypeInputCreate, PatientTypeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";import { ObjectType } from "types";

class PatientTypeService {
	static create = async (data: PatientTypeInputCreate) => {
		return await PatientTypeModel.create(data);
	};

	static update = async (data: PatientTypeInputUpdate["body"], id: number) => {
		let PatientType: PatientType | boolean;

		if (!(await PatientTypeModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await PatientTypeModel.findOne<PatientType>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: {}) => {
		return await PatientTypeModel.findAll<PatientType>(filters);
	};

	static findOne = async (conditions: ObjectType<PatientType>) => {
		return await PatientTypeModel.findOne<PatientType>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await PatientTypeModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default PatientTypeService;
