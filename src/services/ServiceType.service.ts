import { ServiceType, ServiceTypeModel } from "@/models";
import { ServiceTypeInputCreate, ServiceTypeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class ServiceTypeService {
  static create = async (data: ServiceTypeInputCreate) => {
    if (await ServiceTypeModel.findOne<ServiceType>({ name: data.name })) {
      throw new ConflictRequestError("Tên loại dịch vụ đã tồn tại.");
    }

    return await ServiceTypeModel.create(data);
  };

  static update = async (data: ServiceTypeInputUpdate["body"], id: number) => {
    let ServiceType: ServiceType | boolean;

    ServiceType = await ServiceTypeModel.findOne<ServiceType>({ name: data.name });

    if (ServiceType && ServiceType.id !== id) {
      throw new ConflictRequestError("Tên loại dịch vụ đã tồn tại.");
    }

    if (!(await ServiceTypeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await ServiceTypeModel.findOne<ServiceType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await ServiceTypeModel.findAll<ServiceType>(filters, undefined, options);
    const total = await ServiceTypeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<ServiceType>) => {
    return await ServiceTypeModel.findOne<ServiceType>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await ServiceTypeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ServiceTypeService;
