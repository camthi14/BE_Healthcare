import { Operation, OperationModel } from "@/models";
import { OperationInputCreate, OperationInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import DepartmentService from "./Department.service";
import PositionService from "./Position.service";

class OperationService {
  static create = async (data: OperationInputCreate) => {
    return await OperationModel.create(data);
  };

  static update = async (data: OperationInputUpdate["body"], id: number) => {
    let Operation: Operation | boolean;

    if (!(await OperationModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await OperationModel.findOne<Operation>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getByEmployeeId = async (id: string) => {
    const data = await OperationModel.findOne<Operation>({ employee_id: id });

    if (!data) return null;

    const [department, position] = await Promise.all([
      DepartmentService.findOne({ id: data.department_id }),
      PositionService.findOne({ id: data.position_id }),
    ]);

    return {
      ...data,
      department: department ? department : null,
      position: position ? position : null,
    };
  };

  static getByDoctorId = async (id: string) => {
    const data = await OperationModel.findOne<Operation>({ doctor_id: id });

    if (!data) return null;

    const [department, position] = await Promise.all([
      DepartmentService.findOne({ id: data.department_id }),
      PositionService.findOne({ id: data.position_id }),
    ]);

    return {
      ...data,
      department: department ? department : null,
      position: position ? position : null,
    };
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await OperationModel.findAll<Operation>(filters, undefined, options);
    const total = await OperationModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Operation>) => {
    return await OperationModel.findOne<Operation>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await OperationModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default OperationService;
