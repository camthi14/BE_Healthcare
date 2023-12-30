import { Transaction } from "@/lib";
import { PrescriptionsDetail, PrescriptionsDetailModel } from "@/models";
import { PrescriptionsDetailInputCreate, PrescriptionsDetailInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError, generateUUID } from "@/utils";
import { ObjectType, Pagination } from "types";
import MedicineService from "./Medicine.service";

type ResponseGetAll = {
  medicineData: Awaited<ReturnType<typeof MedicineService.getById>>;
} & PrescriptionsDetail;

class PrescriptionsDetailService {
  static create = async (data: PrescriptionsDetailInputCreate) => {
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();
    const id = generateUUID("PDE");

    try {
      await connection.beginTransaction();

      await transaction.create<PrescriptionsDetail>({
        data: { ...data, id },
        pool: connection,
        table: PrescriptionsDetailModel.getTable,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    const response = await PrescriptionsDetailService.getAll(
      { prescriptions_id: data.prescriptions_id },
      {}
    );

    return response;
  };

  static update = async (data: PrescriptionsDetailInputUpdate["body"], id: number) => {
    let PrescriptionsDetail: PrescriptionsDetail | boolean;

    if (!(await PrescriptionsDetailModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await PrescriptionsDetailModel.findOne<PrescriptionsDetail>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await PrescriptionsDetailModel.findAll<PrescriptionsDetail>(
      filters,
      undefined,
      options
    );
    const total = await PrescriptionsDetailModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row): Promise<ResponseGetAll> =>
          new Promise(async (resolve, reject) => {
            try {
              const medicineData = await MedicineService.getById(row.medicine_id!);

              resolve({ ...row, medicineData });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<PrescriptionsDetail>) => {
    return await PrescriptionsDetailModel.findOne<PrescriptionsDetail>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await PrescriptionsDetailModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default PrescriptionsDetailService;
