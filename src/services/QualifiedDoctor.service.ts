import { QualifiedDoctor, QualifiedDoctorModel } from "@/models";
import { QualifiedDoctorInputCreate, QualifiedDoctorInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class QualifiedDoctorService {
  /**
   * @description
   * 1. Find name exits
   * 2. Create QualifiedDoctor
   * 3. Return complete
   * @param data
   * @returns
   */
  static create = async (data: QualifiedDoctorInputCreate) => {
    const [nameExits, characterExists] = await Promise.all([
      QualifiedDoctorModel.findOne<QualifiedDoctor>({ name: data.name }),
      QualifiedDoctorModel.findOne<QualifiedDoctor>({ character: data.character }),
    ]);

    if (nameExits) {
      throw new ConflictRequestError(`Tên trình độ \`${data.name}\` đã tồn tại.`);
    }

    if (characterExists) {
      throw new ConflictRequestError(`Kí tự \`${data.character}\` đã tồn tại.`);
    }

    const created = await QualifiedDoctorModel.create(data);

    return created;
  };

  static update = async (data: QualifiedDoctorInputUpdate["body"], id: number) => {
    const [nameExits, characterExists] = await Promise.all([
      QualifiedDoctorModel.findOne<QualifiedDoctor>({ name: data.name }),
      QualifiedDoctorModel.findOne<QualifiedDoctor>({ character: data.character }),
    ]);

    if (nameExits && nameExits.id !== id) {
      throw new ConflictRequestError(`Tên trình độ \`${data.name}\` đã tồn tại.`);
    }

    if (characterExists && characterExists.id !== id) {
      throw new ConflictRequestError(`Kí tự \`${data.character}\` đã tồn tại.`);
    }

    const updated = await QualifiedDoctorModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await QualifiedDoctorModel.findOne<QualifiedDoctor>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await QualifiedDoctorModel.findAll<QualifiedDoctor>(
      filters,
      undefined,
      options
    );
    const total = await QualifiedDoctorModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<QualifiedDoctor>) => {
    return await QualifiedDoctorModel.findOne<QualifiedDoctor>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await QualifiedDoctorModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default QualifiedDoctorService;
