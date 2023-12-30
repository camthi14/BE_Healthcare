import { Transaction } from "@/lib";
import {
  ExaminationCardsDetail,
  ExaminationCardsDetailModel,
  ResultsDiagnosisSubclinical,
  ResultsDiagnosisSubclinicalModel,
  ResultsImage,
  ResultsImageModel,
  ServiceModel,
} from "@/models";
import { GetByCardDetailIdQuery } from "@/schema";
import { BadRequestError, NotFoundRequestError, generateUUID } from "@/utils";
import { ObjectType, Pagination } from "types";
import ExaminationCardsDetailService from "./ExaminationCardsDetail.service";
import ResultsImageService from "./ResultsImage.service";
import { removeImage } from "@/lib/cloudinary.lib";

type TypeCreate = {
  exam_card_details_id: string;
  subclinical_id: number;
  rate: string;
  results: string;
  images?: string[];
  removeImages?: { id: string }[];
};

class ResultsDiagnosisSubclinicalService {
  /**
   * @description
   * 1. Get results exist, details, count quantity resulted,
   * 2. if exist => update
   * 3. generate uuid
   * 4. Check service_entity === ServiceTable
   * 5. If true Compare quantity count with details.count
   * 5.2. If equal => update ExaminationCardsDetails
   * 6. If => update ExaminationCardsDetails status  finished
   * 7. Create results
   * @param data
   * @returns
   */
  static create = async (data: TypeCreate) => {
    // console.log(data);

    // throw Error("Maintenance");

    const [findExists, details, count] = await Promise.all([
      ResultsDiagnosisSubclinicalService.findOne({
        exam_card_details_id: data.exam_card_details_id,
        subclinical_id: data.subclinical_id,
      }),
      ExaminationCardsDetailService.getById(data.exam_card_details_id),
      ResultsDiagnosisSubclinicalModel.count({
        exam_card_details_id: data.exam_card_details_id,
      }),
    ]);

    const { images, removeImages, ...otherData } = data;

    if (findExists) {
      await ResultsDiagnosisSubclinicalService.update(data, findExists.id!);
      return;
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();
    const id = generateUUID("RED");

    try {
      await connection.beginTransaction();

      if (details.service_entity === ServiceModel.getTable) {
        if (count + 1 === details.count) {
          await transaction.update<Partial<ExaminationCardsDetail>, ExaminationCardsDetail>({
            data: { status: "finished" },
            pool: connection,
            table: ExaminationCardsDetailModel.getTable,
            key: "id",
            valueOfKey: data.exam_card_details_id,
          });
        }
      } else {
        await transaction.update<Partial<ExaminationCardsDetail>, ExaminationCardsDetail>({
          data: { status: "finished" },
          pool: connection,
          table: ExaminationCardsDetailModel.getTable,
          key: "id",
          valueOfKey: data.exam_card_details_id,
        });
      }

      await transaction.create<ResultsDiagnosisSubclinical>({
        data: { ...otherData, id },
        pool: connection,
        table: ResultsDiagnosisSubclinicalModel.getTable,
      });

      if (images?.length) {
        const imagesInsert = images.map((url) => {
          const idImages = generateUUID("IRID");
          return [idImages, id, url, null];
        });

        await transaction.createBulk({
          pool: connection,
          table: ResultsImageModel.getTable,
          data: imagesInsert,
          fillables: ResultsImageModel.getFillables,
          withId: true,
        });
      }

      return id;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static update = async (data: TypeCreate, id: string) => {
    const results = await ResultsDiagnosisSubclinicalService.getById(id);

    const { images, removeImages, ...othersData } = data;

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      const updated = await transaction.update<
        Partial<ResultsDiagnosisSubclinical>,
        ResultsDiagnosisSubclinical
      >({
        data: othersData,
        key: "id",
        pool: connection,
        table: ResultsDiagnosisSubclinicalModel.getTable,
        valueOfKey: id,
      });

      if (!updated) {
        throw new BadRequestError(
          `Có lỗi xảy ra khi cập dữ liệu chỉ định CLS. Không tìm thấy id = ${id}`
        );
      }

      if (images?.length) {
        const imagesInsert = images.map((url) => {
          const idImages = generateUUID("IRID");
          return [idImages, id, url, null];
        });

        await transaction.createBulk({
          pool: connection,
          table: ResultsImageModel.getTable,
          data: imagesInsert,
          fillables: ResultsImageModel.getFillables,
          withId: true,
        });
      }

      if (removeImages?.length) {
        await Promise.all(
          removeImages.map(
            (row) =>
              new Promise(async (resolve, reject) => {
                try {
                  await transaction.delete<ResultsImage>({
                    conditions: { id: row.id },
                    pool: connection,
                    table: ResultsImageModel.getTable,
                  });

                  resolve(true);
                } catch (error) {
                  await connection.rollback();
                  reject(error);
                }
              })
          )
        );
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    if (removeImages?.length && results.images.length) {
      const imageURLs = results.images.filter((t) =>
        removeImages.map((r) => r.id).includes(String(t.id))
      );

      await Promise.all(
        imageURLs.map(
          ({ url }) =>
            new Promise(async (resolve, reject) => {
              try {
                await removeImage(url);
                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        )
      );
    }

    return id;
  };

  static getById = async (id: string) => {
    const data = await ResultsDiagnosisSubclinicalModel.findOne<ResultsDiagnosisSubclinical>({
      id: id,
    });

    if (!data) {
      throw new NotFoundRequestError(
        `Đã có lỗi xảy ra khi tìm dữ liêu CLS. Không tìm thấy id = ${id}`
      );
    }

    const { results } = await ResultsImageService.getAll(
      { result_id: id },
      { order: "created_at" }
    );

    return { ...data, images: results };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ResultsDiagnosisSubclinicalModel.findAll<ResultsDiagnosisSubclinical>(
      filters,
      undefined,
      options
    );
    const total = await ResultsDiagnosisSubclinicalModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<ResultsDiagnosisSubclinical>) => {
    const response = await ResultsDiagnosisSubclinicalModel.findOne<ResultsDiagnosisSubclinical>(
      conditions
    );

    if (!response) return null;

    let images: ResultsImage[] = [];

    if (response) {
      const { results } = await ResultsImageService.getAll(
        { result_id: String(response.id) },
        { order: "created_at" }
      );

      images = results;
    }

    return { ...response, images };
  };

  static getByCardDetailId = async ({
    exam_card_details_id,
    subclinical_id,
  }: GetByCardDetailIdQuery) => {
    const findExists = await ResultsDiagnosisSubclinicalService.findOne({
      exam_card_details_id: exam_card_details_id,
      subclinical_id: subclinical_id,
    });

    return findExists || null;
  };

  static deleteById = async (id: string) => {
    if (!(await ResultsDiagnosisSubclinicalModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ResultsDiagnosisSubclinicalService;
