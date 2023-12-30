import {
  Medicine,
  MedicineDetail,
  MedicineDetailModel,
  MedicineModel,
  MedicineType,
  MedicineTypeModel,
} from "@/models";
import { MedicineTypeInputCreate, MedicineTypeInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import UnitService from "./Unit.service";

class MedicineTypeService {
  static create = async (data: MedicineTypeInputCreate) => {
    return await MedicineTypeModel.create(data);
  };

  static update = async (data: MedicineTypeInputUpdate["body"], id: number) => {
    let MedicineType: MedicineType | boolean;

    if (!(await MedicineTypeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await MedicineTypeModel.findOne<MedicineType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await MedicineTypeModel.findAll<MedicineType>(filters, undefined, options);
    const total = await MedicineTypeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const medicines = await MedicineModel.findAll<Medicine>(
                { medictine_type_id: row.id! },
                undefined,
                {}
              );

              const res = await Promise.all(
                medicines.map(
                  (medicine) =>
                    new Promise(async (resolveV2, rejectV2) => {
                      try {
                        const [infoData, unit] = await Promise.all([
                          MedicineDetailModel.findOne<MedicineDetail>({
                            medicine_id: medicine.id!,
                          }),
                          UnitService.getById(medicine.unit_id),
                        ]);

                        resolveV2({
                          ...medicine,
                          typeName: row.name,
                          infoData: infoData || null,
                          unit,
                        });
                      } catch (error) {
                        rejectV2(error);
                      }
                    })
                )
              );

              resolve({ ...row, medicines: res });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<MedicineType>) => {
    return await MedicineTypeModel.findOne<MedicineType>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await MedicineTypeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default MedicineTypeService;
