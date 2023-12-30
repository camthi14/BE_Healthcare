import { Role, RoleModel } from "@/models";
import { RoleInputCreate, RoleInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";import { ObjectType } from "types";

class RoleService {
	static create = async (data: RoleInputCreate) => {
		if (await RoleModel.findOne<Role>({ name: data.name })) {
			throw new ConflictRequestError("name đã tồn tại...");
		}

		return await RoleModel.create(data);
	};

	static update = async (data: RoleInputUpdate["body"], id: number) => {
		let Role: Role | boolean;

		Role = await RoleModel.findOne<Role>({ name: data.name });

		if (Role && Role.id !== id) {
			throw new ConflictRequestError("name đã tồn tại...");
		}

		if (!(await RoleModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await RoleModel.findOne<Role>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: {}) => {
		return await RoleModel.findAll<Role>(filters);
	};

	static findOne = async (conditions: ObjectType<Role>) => {
		return await RoleModel.findOne<Role>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await RoleModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default RoleService;
