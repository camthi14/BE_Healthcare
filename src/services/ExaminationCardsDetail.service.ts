import {
  ExaminationCardOptions,
  ExaminationCardsDetail,
  ExaminationCardsDetailModel,
  ExaminationCardsDetailStatus,
  ResultsImage,
  ServiceModel,
  ServiceSubclinicalModel,
} from "@/models";
import { ExaminationCardsDetailInputCreate, ExaminationCardsDetailInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError, isNotNull } from "@/utils";
import { ObjectType, Pagination } from "types";
import DoctorService from "./Doctor.service";
import ResultsDiagnosisSubclinicalService from "./ResultsDiagnosisSubclinical.service";
import ResultsImageService from "./ResultsImage.service";
import ServiceService from "./Service.service";
import SubclinicalService from "./Subclinical.service";

type GetByStatusResponse = ExaminationCardsDetail & {
  subclinicalData: null | Awaited<ReturnType<typeof SubclinicalService.getById>>;
  serviceData: null | Awaited<ReturnType<typeof ServiceService.getById>>;
  results: null | Awaited<ReturnType<typeof ResultsDiagnosisSubclinicalService.findOne>>;
  doctorName: string | null;
};

class ExaminationCardsDetailService {
  static create = async (data: ExaminationCardsDetailInputCreate) => {
    return await ExaminationCardsDetailModel.create(data);
  };

  static update = async (data: ExaminationCardsDetailInputUpdate["body"], id: number) => {
    let ExaminationCardsDetail: ExaminationCardsDetail | boolean;

    if (!(await ExaminationCardsDetailModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await ExaminationCardsDetailModel.findOne<ExaminationCardsDetail>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(
        `Đã có lỗi xảy ra khi tìm dữ liêu ExaminationCardsDetail. Không tìm thấy id = ${id}`
      );
    }

    if (data.service_entity === ServiceModel.getTable) {
      const count = await ServiceSubclinicalModel.count({ service_id: data.service_value });
      return { ...data, count };
    }

    return { ...data, count: 0 };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ExaminationCardsDetailModel.findAll<ExaminationCardsDetail>(
      filters,
      undefined,
      options
    );

    console.log({ filters, options });

    const total = await ExaminationCardsDetailModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    let response = await Promise.all(
      results.map(
        (row): Promise<GetByStatusResponse> =>
          new Promise(async (resolve, reject) => {
            try {
              if (row.service_entity === ServiceModel.getTable) {
                const serviceData = await ServiceService.getById(Number(row.service_value), row.id);

                return resolve({
                  ...row,
                  serviceData: serviceData,
                  subclinicalData: null,
                  results: null,
                  doctorName: null,
                });
              }

              const [subclinicalData, res, doctor] = await Promise.all([
                SubclinicalService.getById(Number(row.service_value)),
                ResultsDiagnosisSubclinicalService.findOne({
                  exam_card_details_id: row.id,
                  subclinical_id: Number(row.service_value),
                }),
                row.doctor_id ? DoctorService.getById(row.doctor_id) : null,
              ]);

              resolve({
                ...row,
                serviceData: null,
                subclinicalData: subclinicalData,
                results: res,
                doctorName: doctor?.display_name || null,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<ExaminationCardsDetail>) => {
    return await ExaminationCardsDetailModel.findOne<ExaminationCardsDetail>(conditions);
  };

  static getByStatus = async ({
    examinationCardId,
    options,
    doctorId,
    status,
  }: {
    examinationCardId: string;
    options: ExaminationCardOptions;
    doctorId?: string;
    status?: ExaminationCardsDetailStatus;
  }) => {
    let filters = {
      examination_card_id: examinationCardId,
      ...(options.match(/doctor/) ? { doctor_id: doctorId || isNotNull() } : {}),
      ...(status ? { status: status } : {}),
    };

    const { results } = await ExaminationCardsDetailService.getAll(filters, {});

    if (!results.length) return [];

    let response = await Promise.all(
      results.map(
        (row): Promise<GetByStatusResponse> =>
          new Promise(async (resolve, reject) => {
            try {
              if (row.service_entity === ServiceModel.getTable) {
                const serviceData = await ServiceService.getById(Number(row.service_value));
                return resolve({ ...row, serviceData: serviceData, subclinicalData: null });
              }

              const subclinicalData = await SubclinicalService.getById(Number(row.service_value));
              resolve({ ...row, serviceData: null, subclinicalData: subclinicalData });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return response;
  };

  static deleteById = async (id: number) => {
    if (!(await ExaminationCardsDetailModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ExaminationCardsDetailService;
