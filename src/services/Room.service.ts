import { Equipment, EquipmentModel, Room, RoomModel } from "@/models";
import { RoomInputCreate, RoomInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import EquipmentService from "./Equipment.service";

class RoomService {
  static create = async (data: RoomInputCreate) => {
    if (await RoomModel.findOne<Room>({ name: data.name })) {
      throw new ConflictRequestError("Tên phòng đã tồn tại...");
    }

    return await RoomModel.create(data);
  };

  static update = async (data: RoomInputUpdate["body"], id: number) => {
    let Room: Room | boolean;

    Room = await RoomModel.findOne<Room>({ name: data.name });

    if (Room && Room.id !== id) {
      throw new ConflictRequestError("Tên phòng đã tồn tại...");
    }

    if (!(await RoomModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await RoomModel.findOne<Room>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const dataEquipment = await EquipmentModel.findOne({ id: data.equipment_id });
    return { ...data, dataEquipment };
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await RoomModel.findAll<Room>(filters, undefined, options);
    const total = await RoomModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const [dataEquipment] = await Promise.all([
                EquipmentService.getById(row.equipment_id),
              ]);
              resolve({ ...row, dataEquipment });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Room>) => {
    return await RoomModel.findOne<Room>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await RoomModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RoomService;
