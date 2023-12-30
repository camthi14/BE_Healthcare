import { ServiceSubclinical, ServiceSubclinicalModel } from "@/models";
import { ServiceSubclinicalInputCreate, ServiceSubclinicalInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import SubclinicalService from "./Subclinical.service";

type Results = Awaited<ReturnType<typeof SubclinicalService.getById>>;

class ServiceSubclinicalService {
  static create = async (data: ServiceSubclinicalInputCreate) => {
    return await ServiceSubclinicalModel.create(data);
  };

  static update = async (data: ServiceSubclinicalInputUpdate["body"], id: number) => {
    let ServiceSubclinical: ServiceSubclinical | boolean;

    if (!(await ServiceSubclinicalModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await ServiceSubclinicalModel.findOne<ServiceSubclinical>({ service_id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ServiceSubclinicalModel.findAll<ServiceSubclinical>(
      filters,
      undefined,
      options
    );
    const total = await ServiceSubclinicalModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<Results> =>
          new Promise(async (resolve, reject) => {
            try {
              const subclinicalData = await SubclinicalService.getById(row.subclinical_id);
              resolve(subclinicalData);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<ServiceSubclinical>) => {
    return await ServiceSubclinicalModel.findOne<ServiceSubclinical>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await ServiceSubclinicalModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ServiceSubclinicalService;
