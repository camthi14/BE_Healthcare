import { Department, DepartmentModel } from "@/models";
import { DepartmentInputCreate, DepartmentInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class DepartmentService {
  static create = async (data: DepartmentInputCreate) => {
    const nameExists = await DepartmentModel.findOne<Department>({ name: data.name });

    if (nameExists) {
      throw new ConflictRequestError(`Tên bộ phận \`${data.name}\` đã tồn tại...`);
    }

    const created = await DepartmentModel.create(data);
    return created;
  };

  static update = async (data: DepartmentInputUpdate["body"], id: number) => {
    const nameExists = await DepartmentModel.findOne<Department>({ name: data.name });

    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(`Tên bộ phận \`${data.name}\` đã tồn tại...`);
    }
    const updated = await DepartmentModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await DepartmentModel.findOne<Department>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await DepartmentModel.findAll<Department>(filters, undefined, options);
    const total = await DepartmentModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Department>) => {
    return await DepartmentModel.findOne<Department>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await DepartmentModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default DepartmentService;
