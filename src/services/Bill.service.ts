import { Bill, BillModel } from "@/models";
import { BillInputCreate, BillInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import EmployeeService from "./Employee.service";

class BillService {
  static create = async (data: BillInputCreate) => {
    return await BillModel.create(data);
  };

  static update = async (data: BillInputUpdate["body"], id: string) => {
    const updated = await BillModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await BillModel.findOne<Bill>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const [dataEmployee] = await Promise.all([EmployeeService.getById(data.employee_id!)]);

    return { ...data, dataEmployee };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await BillModel.findAll<Bill>(filters, undefined, options);
    const total = await BillModel.count(filters);

    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              if (!row.employee_id) return resolve({ ...row, dataEmployee: null });

              const [dataEmployee] = await Promise.all([EmployeeService.getById(row.employee_id!)]);
              resolve({ ...row, dataEmployee });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Bill>) => {
    return await BillModel.findOne<Bill>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await BillModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default BillService;
