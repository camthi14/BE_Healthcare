import { MedicineDetail, MedicineDetailModel } from "@/models";
import { MedicineDetailInputCreate, MedicineDetailInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class MedicineDetailService {
  static create = async (data: MedicineDetailInputCreate) => {
    return await MedicineDetailModel.create(data);
  };

  static update = async (data: MedicineDetailInputUpdate["body"], id: number) => {
    let MedicineDetail: MedicineDetail | boolean;

    if (!(await MedicineDetailModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await MedicineDetailModel.findOne<MedicineDetail>({ medicine_id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await MedicineDetailModel.findAll<MedicineDetail>(filters, undefined, options);
    const total = await MedicineDetailModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<MedicineDetail>) => {
    return await MedicineDetailModel.findOne<MedicineDetail>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await MedicineDetailModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default MedicineDetailService;
