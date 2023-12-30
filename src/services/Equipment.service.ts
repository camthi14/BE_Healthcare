import { Transaction } from "@/lib";
import { removeImage, resultUrlImage } from "@/lib/cloudinary.lib";
import { Equipment, EquipmentModel } from "@/models";
import { EquipmentInputCreate, EquipmentInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class EquipmentService {
  static create = async (data: EquipmentInputCreate & { photo?: string }) => {
    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();
      const nameExists = await EquipmentService.findOne({ name: data.name });

      if (nameExists) {
        throw new ConflictRequestError(`Tên thiết bị \`${data.name}\` đã tồn tại`);
      }
      const { name, desc, photo, equipment_type_id } = data;

      await Promise.all([
        transaction.create<Equipment>({
          data: {
            name,
            desc,
            equipment_type_id: +equipment_type_id,
            photo: photo ?? null,
          },
          pool: connect,
          table: EquipmentModel.getTable,
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

  static update = async (data: EquipmentInputUpdate["body"] & { photo?: string }, id: number) => {
    //@ts-ignore
    const nameExits = await EquipmentModel.findOne<Equipment>({ name_like: data.name });

    if (nameExits && nameExits.id !== id) {
      throw new ConflictRequestError("Tên thiết bị đã tồn tại.");
    }

    const response = await EquipmentService.getById(id);

    if (data?.photo) {
      response.photo && (await removeImage(response.photo));
    } else {
      delete data?.photo;
    }

    const updated = await EquipmentModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await EquipmentModel.findOne<Equipment>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return { ...data, photo: data.photo ? resultUrlImage(data.photo) : null };
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await EquipmentModel.findAll<Equipment>(filters, undefined, options);
    const total = await EquipmentModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = results.map((item) => ({
      ...item,
      photo: item.photo ? resultUrlImage(item.photo) : null,
    }));

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Equipment>) => {
    return await EquipmentModel.findOne<Equipment>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await EquipmentModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default EquipmentService;
