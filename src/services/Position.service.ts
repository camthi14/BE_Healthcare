import { Position, PositionModel } from "@/models";
import { PositionInputCreate, PositionInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class PositionService {
  static create = async (data: PositionInputCreate) => {
    const nameExists = await PositionModel.findOne<Position>({ name: data.name });

    if (nameExists) {
      throw new ConflictRequestError(`Tên chức vụ \`${data.name}\` đã tồn tại...`);
    }

    const created = await PositionModel.create(data);
    return created;
  };

  static update = async (data: PositionInputUpdate["body"], id: number) => {
    const nameExists = await PositionModel.findOne<Position>({ name: data.name });

    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(`Tên chức vụ \`${data.name}\` đã tồn tại...`);
    }
    const updated = await PositionModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await PositionModel.findOne<Position>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await PositionModel.findAll<Position>(filters, undefined, options);
    const total = await PositionModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Position>) => {
    return await PositionModel.findOne<Position>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await PositionModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default PositionService;
