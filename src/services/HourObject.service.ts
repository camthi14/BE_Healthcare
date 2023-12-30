import { HourObject, HourObjectModel } from "@/models";
import { HourObjectInputCreate, HourObjectInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class HourObjectService {
  static create = async (data: HourObjectInputCreate) => {
    return await HourObjectModel.create(data);
  };

  static update = async (data: HourObjectInputUpdate["body"], id: number) => {
    let HourObject: HourObject | boolean;

    if (!(await HourObjectModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await HourObjectModel.findOne<HourObject>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await HourObjectModel.findAll<HourObject>(filters, undefined, options);
    const total = await HourObjectModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<HourObject>) => {
    return await HourObjectModel.findOne<HourObject>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await HourObjectModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default HourObjectService;
