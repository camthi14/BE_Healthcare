import { Notification, NotificationModel } from "@/models";
import { NotificationInputCreate, NotificationInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class NotificationService {
  static create = async (data: NotificationInputCreate) => {
    return await NotificationModel.create(data);
  };

  static update = async (data: NotificationInputUpdate["body"], id: number) => {
    let Notification: Notification | boolean;

    if (!(await NotificationModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await NotificationModel.findOne<Notification>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await NotificationModel.findAll<Notification>(filters, undefined, options);
    const total = await NotificationModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Notification>) => {
    return await NotificationModel.findOne<Notification>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await NotificationModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default NotificationService;
