import { Permission, PermissionModel } from "@/models";
import { PermissionInputCreate, PermissionInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";import { ObjectType } from "types";

class PermissionService {
	static create = async (data: PermissionInputCreate) => {
		if (await PermissionModel.findOne<Permission>({ name: data.name })) {
			throw new ConflictRequestError("name đã tồn tại...");
		}

		if (await PermissionModel.findOne<Permission>({ alias: data.alias })) {
			throw new ConflictRequestError("alias đã tồn tại...");
		}

		return await PermissionModel.create(data);
	};

	static update = async (data: PermissionInputUpdate["body"], id: number) => {
		let Permission: Permission | boolean;

		Permission = await PermissionModel.findOne<Permission>({ name: data.name });

		if (Permission && Permission.id !== id) {
			throw new ConflictRequestError("name đã tồn tại...");
		}

		Permission = await PermissionModel.findOne<Permission>({ alias: data.alias });

		if (Permission && Permission.id !== id) {
			throw new ConflictRequestError("alias đã tồn tại...");
		}

		if (!(await PermissionModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await PermissionModel.findOne<Permission>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: {}) => {
		return await PermissionModel.findAll<Permission>(filters);
	};

	static findOne = async (conditions: ObjectType<Permission>) => {
		return await PermissionModel.findOne<Permission>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await PermissionModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default PermissionService;
