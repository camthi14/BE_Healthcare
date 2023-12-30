import { PatientInfo, PatientInfoModel } from "@/models";
import { PatientInfoInputCreate, PatientInfoInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";import { ObjectType } from "types";

class PatientInfoService {
	static create = async (data: PatientInfoInputCreate) => {
		return await PatientInfoModel.create(data);
	};

	static update = async (data: PatientInfoInputUpdate["body"], id: number) => {
		let PatientInfo: PatientInfo | boolean;

		if (!(await PatientInfoModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await PatientInfoModel.findOne<PatientInfo>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: {}) => {
		return await PatientInfoModel.findAll<PatientInfo>(filters);
	};

	static findOne = async (conditions: ObjectType<PatientInfo>) => {
		return await PatientInfoModel.findOne<PatientInfo>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await PatientInfoModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default PatientInfoService;
