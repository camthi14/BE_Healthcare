import { resultUrlImage } from "@/lib/cloudinary.lib";
import { ResultsImage, ResultsImageModel } from "@/models";
import { ResultsImageInputCreate, ResultsImageInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class ResultsImageService {
  static create = async (data: ResultsImageInputCreate) => {
    return await ResultsImageModel.create(data);
  };

  static update = async (data: ResultsImageInputUpdate["body"], id: number) => {
    let ResultsImage: ResultsImage | boolean;

    if (!(await ResultsImageModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await ResultsImageModel.findOne<ResultsImage>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ResultsImageModel.findAll<ResultsImage>(filters, undefined, options);
    const total = await ResultsImageModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    const response = results.map((row) => ({ ...row, url: resultUrlImage(row.url) }));
    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<ResultsImage>) => {
    return await ResultsImageModel.findOne<ResultsImage>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await ResultsImageModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ResultsImageService;
