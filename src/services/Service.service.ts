import { Transaction } from "@/lib";
import { removeImage, resultUrlImage } from "@/lib/cloudinary.lib";
import {
  Service,
  ServiceModel,
  ServiceSubclinical,
  ServiceSubclinicalModel,
  Subclinical,
} from "@/models";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import ResultsDiagnosisSubclinicalService from "./ResultsDiagnosisSubclinical.service";
import ServiceSubclinicalService from "./ServiceSubclinical.service";

type Create = {
  service_type_id: number;
  name: string;
  content: string;
  desc: string;
  price: number;
  photo?: string;
  subclinical: Subclinical[];
};

type Results = Subclinical & {
  results: Awaited<ReturnType<typeof ResultsDiagnosisSubclinicalService.findOne>>;
};

class ServiceService {
  static create = async (data: Create) => {
    //@ts-ignore
    const nameExits = await ServiceModel.findOne<Service>({ name_like: data.name });

    if (nameExits) {
      throw new ConflictRequestError(`Tên gói dịch vụ \`${data.name}\` đã tồn tại`);
    }

    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();

      const { name, desc, photo, service_type_id, price, content, subclinical } = data;

      const serviceId = await transaction.create<Service>({
        data: {
          name,
          desc,
          content,
          price: +price,
          service_type_id: +service_type_id,
          photo: photo ?? null,
          status: "active",
        },
        pool: connect,
        table: ServiceModel.getTable,
      });

      const subclinicalInsert = subclinical.map((r) => [serviceId, r.id, null]);

      await transaction.createBulk({
        pool: connect,
        table: ServiceSubclinicalModel.getTable,
        data: subclinicalInsert,
        fillables: ServiceSubclinicalModel.getFillables,
      });

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

  static update = async (data: Create, id: number) => {
    //@ts-ignore
    const nameExits = await ServiceModel.findOne<Service>({ name_like: data.name });

    if (nameExits && nameExits.id !== id) {
      throw new ConflictRequestError(`Tên gói dịch vụ \`${data.name}\` đã tồn tại`);
    }

    const response = await ServiceService.getById(id);
    console.log(data);

    if (data?.photo) {
      response.photo && (await removeImage(response.photo));
    } else {
      delete data?.photo;
    }

    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();

      const { subclinical, ...others } = data;

      const [updated] = await Promise.all([
        transaction.update<Service, Service>({
          data: others,
          key: "id",
          valueOfKey: id,
          pool: connect,
          table: ServiceModel.getTable,
        }),
        transaction.delete<ServiceSubclinical>({
          conditions: { service_id: id },
          pool: connect,
          table: ServiceSubclinicalModel.getTable,
        }),
      ]);

      if (!updated) {
        throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
      }

      const subclinicalInsert = subclinical.map((r) => [id, r.id, null]);

      await transaction.createBulk({
        pool: connect,
        table: ServiceSubclinicalModel.getTable,
        data: subclinicalInsert,
        fillables: ServiceSubclinicalModel.getFillables,
      });

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

  static getById = async (id: number, examCardId?: string) => {
    const data = await ServiceModel.findOne<Service>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(
        `Đã có lỗi xảy ra khi tìm dữ liêu Service. Không tìm thấy id = ${id}`
      );
    }

    const { results: subclinicalData } = await ServiceSubclinicalService.getAll(
      { service_id: id },
      {}
    );

    if (examCardId) {
      const res = await Promise.all(
        subclinicalData.map(
          (r): Promise<Results> =>
            new Promise(async (rs, rj) => {
              try {
                const results = await ResultsDiagnosisSubclinicalService.findOne({
                  exam_card_details_id: examCardId,
                  subclinical_id: Number(r.id),
                });

                rs({ ...r, results: results });
              } catch (error) {
                rj(error);
              }
            })
        )
      );

      return {
        ...data,
        photo: data.photo ? resultUrlImage(data.photo) : null,
        subclinicalData: res,
      };
    }

    return { ...data, photo: data.photo ? resultUrlImage(data.photo) : null, subclinicalData };
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await ServiceModel.findAll<Service>(filters, undefined, options);
    const total = await ServiceModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    const data = results.map((item) => ({
      ...item,
      photo: item.photo ? resultUrlImage(item.photo) : null,
    }));

    const response = await Promise.all(
      data.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const { results: subclinicalData } = await ServiceSubclinicalService.getAll(
                { service_id: row.id },
                {}
              );

              resolve({ ...row, subclinicalData });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Service>) => {
    return await ServiceModel.findOne<Service>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await ServiceModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ServiceService;
