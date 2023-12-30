import { Unit, UnitModel } from "@/models";
import { UnitInputCreate, UnitInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class UnitService {
  static create = async (data: UnitInputCreate) => {
    let [nameExists, characterExist] = await Promise.all([
      UnitModel.findOne<Unit>({ name: data.name }),
      UnitModel.findOne<Unit>({ character: data.character }),
    ]);

    if (nameExists) {
      throw new ConflictRequestError(`Tên đơn vị thuốc \`${data.name}\` đã tồn tại...`);
    }

    if (characterExist) {
      throw new ConflictRequestError(`Kí tự đơn vị thuốc \`${data.character}\` đã tồn tại...`);
    }

    const created = await UnitModel.create(data);

    return created;
  };

  static update = async (data: UnitInputUpdate["body"], id: number) => {
    let [nameExists, characterExist] = await Promise.all([
      UnitModel.findOne<Unit>({ name: data.name }),
      UnitModel.findOne<Unit>({ character: data.character }),
    ]);

    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(`Tên đơn vị thuốc \`${data.name}\` đã tồn tại...`);
    }

    if (characterExist && characterExist.id !== id) {
      throw new ConflictRequestError(`Kí tự đơn vị thuốc \`${data.character}\` đã tồn tại...`);
    }

    const updated = await UnitModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await UnitModel.findOne<Unit>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await UnitModel.findAll<Unit>(filters, undefined, options);
    const total = await UnitModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Unit>) => {
    return await UnitModel.findOne<Unit>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await UnitModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default UnitService;
