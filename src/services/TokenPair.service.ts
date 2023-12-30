import { TokenPair, TokenPairModel } from "@/models";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";

class TokenPairService {
  static create = async (data: TokenPair) => {
    return await TokenPairModel.create(data);
  };

  static update = async (data: Partial<TokenPair>, id: number) => {
    let TokenPair: TokenPair | boolean;

    if (!(await TokenPairModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await TokenPairModel.findOne<TokenPair>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: {}) => {
    return await TokenPairModel.findAll<TokenPair>(filters);
  };

  static findOne = async (conditions: ObjectType<TokenPair>) => {
    return await TokenPairModel.findOne<TokenPair>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await TokenPairModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default TokenPairService;
