import { BookingsImage, BookingsImageModel } from "@/models";
import { BookingsImageInputCreate, BookingsImageInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class BookingsImageService {
  static create = async (data: BookingsImageInputCreate) => {
    return await BookingsImageModel.create(data);
  };

  static update = async (data: BookingsImageInputUpdate["body"], id: number) => {
    let BookingsImage: BookingsImage | boolean;

    if (!(await BookingsImageModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await BookingsImageModel.findOne<BookingsImage>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await BookingsImageModel.findAll<BookingsImage>(filters, undefined, options);
    const total = await BookingsImageModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<BookingsImage>) => {
    return await BookingsImageModel.findOne<BookingsImage>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await BookingsImageModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default BookingsImageService;
