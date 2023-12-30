import { DoctorsInfor, DoctorsInforModel } from "@/models";
import { DoctorsInforInputCreate, DoctorsInforInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";

class DoctorsInforService {
  static create = async (data: DoctorsInforInputCreate) => {
    return await DoctorsInforModel.create(data);
  };

  static update = async (data: DoctorsInforInputUpdate["body"], id: number) => {
    let DoctorsInfor: DoctorsInfor | boolean;

    if (!(await DoctorsInforModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await DoctorsInforModel.findOne<DoctorsInfor>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: {}) => {
    return await DoctorsInforModel.findAll<DoctorsInfor>(filters);
  };

  static findOne = async (conditions: ObjectType<DoctorsInfor>) => {
    return await DoctorsInforModel.findOne<DoctorsInfor>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await DoctorsInforModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default DoctorsInforService;
