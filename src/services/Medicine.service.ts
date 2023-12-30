import { Transaction } from "@/lib";
import {
  Medicine,
  MedicineDetail,
  MedicineDetailModel,
  MedicineModel,
  MedicineType,
  MedicineTypeModel,
} from "@/models";
import { MedicineInputCreate, MedicineInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError, generateUUID } from "@/utils";
import { ObjectType, Pagination } from "types";
import MedicineTypeService from "./MedicineType.service";
import UnitService from "./Unit.service";

class MedicineService {
  static create = async (data: MedicineInputCreate) => {
    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();
      const nameExits = await MedicineService.findOne({ name: data.name });

      if (nameExits) {
        throw new ConflictRequestError(`Tên thuốc \`${data.name}\` đã tồn tại`);
      }

      const {
        medictine_type_id,
        unit_id,
        name,
        quantity,
        price,
        production_date,
        drug_concentration,
        price_sell,
        ingredients,
        expired_at,
      } = data;

      const uuid = generateUUID("M");

      await Promise.all([
        transaction.create<Medicine>({
          data: {
            id: uuid,
            medictine_type_id: +medictine_type_id,
            unit_id: +unit_id,
            name,
            status: "active",
          },
          pool: connect,
          table: MedicineModel.getTable,
        }),
        transaction.create<MedicineDetail>({
          data: {
            quantity: +quantity,
            price: +price,
            production_date,
            drug_concentration: +drug_concentration,
            price_sell: +price_sell,
            ingredients,
            expired_at,
            status: "active",
            medicine_id: uuid,
          },
          pool: connect,
          table: MedicineDetailModel.getTable,
        }),
      ]);

      return true;
    } catch (error) {
      console.log(`rollback`);
      await connect.rollback();
      throw error;
    } finally {
      console.log(`finally`);
      await connect.commit();
      connect.release();
      transaction.releaseConnection(connect);
    }
  };

  static update = async (data: MedicineInputUpdate["body"], id: string) => {
    const nameExits = await MedicineService.findOne({ name: data.name });

    if (nameExits && nameExits.id !== id) {
      throw new ConflictRequestError(`Tên thuốc \`${data.name}\` đã tồn tại`);
    }

    const {
      medictine_type_id,
      unit_id,
      name,
      quantity,
      price,
      production_date,
      drug_concentration,
      price_sell,
      ingredients,
      expired_at,
    } = data;

    const update = await MedicineModel.update(
      {
        medictine_type_id,
        unit_id,
        name,
      },
      id
    );

    if (!update) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    await MedicineDetailModel.update<Partial<MedicineDetail>, MedicineDetail>(
      {
        price,
        production_date,
        price_sell,
        expired_at,
        quantity,
        drug_concentration,
        ingredients,
      },
      id,
      "medicine_id"
    );

    return true;
  };

  static getById = async (id: string) => {
    const [data, infoData] = await Promise.all([
      MedicineModel.findOne<Medicine>({ id: id }),
      MedicineDetailModel.findOne<MedicineDetail>({ medicine_id: id }),
    ]);

    if (!data || !infoData) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const medicineType = await MedicineTypeModel.findOne<MedicineType>({
      id: data.medictine_type_id,
    });

    const unitType = await UnitService.findOne({
      id: data.unit_id,
    });

    return { ...data, infoData, medicineType: medicineType || null, unit: unitType || null };
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await MedicineModel.findAll<Medicine>(filters, undefined, options);
    const total = await MedicineModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const [infoData, medicineType] = await Promise.all([
                MedicineDetailModel.findOne<MedicineDetail>({
                  medicine_id: row.id,
                }),
                MedicineTypeService.getById(row.medictine_type_id),
              ]);
              resolve({ ...row, infoData: infoData || null, medicineType });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Medicine>) => {
    return await MedicineModel.findOne<Medicine>(conditions);
  };

  static deleteById = async (id: string) => {
    await MedicineDetailModel.delete<MedicineDetail>({ medicine_id: id });

    if (!(await MedicineModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default MedicineService;
