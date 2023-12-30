import { EmployeeInfo, EmployeeInfoModel } from "@/models";
import { EmployeeInfoInputCreate, EmployeeInfoInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";import { ObjectType } from "types";

class EmployeeInfoService {
	static create = async (data: EmployeeInfoInputCreate) => {
		return await EmployeeInfoModel.create(data);
	};

	static update = async (data: EmployeeInfoInputUpdate["body"], id: number) => {
		let EmployeeInfo: EmployeeInfo | boolean;

		if (!(await EmployeeInfoModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await EmployeeInfoModel.findOne<EmployeeInfo>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: {}) => {
		return await EmployeeInfoModel.findAll<EmployeeInfo>(filters);
	};

	static findOne = async (conditions: ObjectType<EmployeeInfo>) => {
		return await EmployeeInfoModel.findOne<EmployeeInfo>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await EmployeeInfoModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default EmployeeInfoService;
