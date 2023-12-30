import { Transaction } from "@/lib";
import {
  Room,
  RoomModel,
  Subclinical,
  SubclinicalModel,
  SubclinicalType,
  SubclinicalTypeModel,
} from "@/models";
import { SubclinicalInputCreate, SubclinicalInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import RoomService from "./Room.service";
import SubclinicalTypeService from "./SubclinicalType.service";

class SubclinicalService {
  static create = async (data: SubclinicalInputCreate) => {
    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();
      const nameExists = await SubclinicalService.findOne({ name: data.name });

      if (nameExists) {
        throw new ConflictRequestError(`Tên CLS \`${data.name}\` đã tồn tại`);
      }
      const { name, desc, room_id, subclinical_type_id, price, content } = data;

      await Promise.all([
        transaction.create<Subclinical>({
          data: {
            name,
            desc,
            content,
            price: +price,
            room_id: +room_id,
            subclinical_type_id: +subclinical_type_id,
            status: "active",
          },
          pool: connect,
          table: SubclinicalModel.getTable,
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

  static update = async (data: SubclinicalInputUpdate["body"], id: number) => {
    //@ts-ignore
    const nameExits = await SubclinicalModel.findOne<Subclinical>({ name_like: data.name });

    if (nameExits && nameExits.id !== id) {
      throw new ConflictRequestError("Tên CLS đã tồn tại.");
    }

    const updated = await SubclinicalModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await SubclinicalModel.findOne<Subclinical>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(
        `Đã có lỗi xảy ra khi tìm dữ liêu Subclinical. Không tìm thấy id = ${id}`
      );
    }

    const dataRoom = await RoomModel.findOne<Room>({ id: data.room_id });
    const dataSubclinicalType = await SubclinicalTypeModel.findOne<SubclinicalType>({
      id: data.subclinical_type_id,
    });

    return { ...data, dataRoom, dataSubclinicalType };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await SubclinicalModel.findAll<Subclinical>(filters, undefined, options);
    const total = await SubclinicalModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const [dataRoom, dataSubclinicalType] = await Promise.all([
                RoomService.getById(row.room_id),
                SubclinicalTypeService.getById(row.subclinical_type_id),
              ]);
              resolve({ ...row, dataRoom, dataSubclinicalType });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Subclinical>) => {
    return await SubclinicalModel.findOne<Subclinical>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await SubclinicalModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default SubclinicalService;
