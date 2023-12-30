import { RefreshTokensUse, RefreshTokensUseModel } from "@/models";
import { RefreshTokensUseInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";

class RefreshTokensUseService {
  static create = async (data: RefreshTokensUse) => {
    return await RefreshTokensUseModel.create(data);
  };

  static update = async (data: RefreshTokensUseInputUpdate["body"], id: number) => {
    let RefreshTokensUse: RefreshTokensUse | boolean;

    if (!(await RefreshTokensUseModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await RefreshTokensUseModel.findOne<RefreshTokensUse>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: {}) => {
    return await RefreshTokensUseModel.findAll<RefreshTokensUse>(filters);
  };

  static findOne = async (conditions: ObjectType<RefreshTokensUse>) => {
    return await RefreshTokensUseModel.findOne<RefreshTokensUse>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await RefreshTokensUseModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RefreshTokensUseService;
