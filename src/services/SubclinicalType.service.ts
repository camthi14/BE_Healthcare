import { SubclinicalType, SubclinicalTypeModel } from "@/models";
import { SubclinicalTypeInputCreate, SubclinicalTypeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import SubclinicalService from "./Subclinical.service";

class SubclinicalTypeService {
  static create = async (data: SubclinicalTypeInputCreate) => {
    return await SubclinicalTypeModel.create(data);
  };

  static update = async (data: SubclinicalTypeInputUpdate["body"], id: number) => {
    let SubclinicalType: SubclinicalType | boolean;

    if (!(await SubclinicalTypeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await SubclinicalTypeModel.findOne<SubclinicalType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await SubclinicalTypeModel.findAll<SubclinicalType>(
      filters,
      undefined,
      options
    );
    const total = await SubclinicalTypeModel.count(filters);

    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (t) =>
          new Promise(async (resolve, reject) => {
            try {
              const subclinical = await SubclinicalService.getAll(
                { subclinical_type_id: t.id! },
                { order: "created_at,asc" }
              );

              resolve({ ...t, subclinical: subclinical.results });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<SubclinicalType>) => {
    return await SubclinicalTypeModel.findOne<SubclinicalType>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await SubclinicalTypeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default SubclinicalTypeService;
