import { Transaction } from "@/lib";
import {
  Bill,
  BillModel,
  Booking,
  BookingModel,
  ExaminationCard,
  ExaminationCardModel,
  Prescription,
  PrescriptionModel,
  PrescriptionsDetail,
  PrescriptionsDetailModel,
} from "@/models";
import {
  AddPrescriptionDetailsInput,
  GetByExamCardIdQuery,
  GetByExamCardIdQueryV2,
  PrescriptionInputCreate,
  PrescriptionInputUpdate,
  ReceivePrescriptionInput,
} from "@/schema";
import { BadRequestError, NotFoundRequestError, generateUUID, getInfoData } from "@/utils";
import { ObjectType, Pagination } from "types";
import BillService from "./Bill.service";
import ExaminationCardService from "./ExaminationCard.service";
import PrescriptionsDetailService from "./PrescriptionsDetail.service";
import dayjs from "dayjs";

class PrescriptionService {
  static create = async (data: PrescriptionInputCreate) => {
    const prescriptionExists = await PrescriptionService.getByExamCardId({
      doctorId: data.doctor_id,
      examCardId: data.exam_card_id,
    });

    if (prescriptionExists) {
      const response = await PrescriptionService.update(data, prescriptionExists.id!);
      return response;
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();
    const id = generateUUID("PE");

    try {
      await connection.beginTransaction();

      await transaction.create<Prescription>({
        data: { ...data, id },
        pool: connection,
        table: PrescriptionModel.getTable,
      });

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

  static update = async (data: PrescriptionInputUpdate["body"], id: string) => {
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      const updated = await transaction.update<Partial<Prescription>, Prescription>({
        data: { ...data },
        pool: connection,
        table: PrescriptionModel.getTable,
        key: "id",
        valueOfKey: id,
      });

      if (!updated) {
        throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
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

  static addPrescriptionDetails = async (data: AddPrescriptionDetailsInput) => {
    console.log(data.exam_card_id);

    const [findBill, examCard] = await Promise.all([
      BillService.findOne({ examination_card_id: data.exam_card_id, payment_for: "medicine" }),
      ExaminationCardService.getById(data.exam_card_id),
    ]);

    const prescriptionDetailsFilterInserts = data.medicines.filter((t) => !t.id);
    const prescriptionDetailsFilterUpdate = data.medicines.filter((t) => t.id);

    const dataInserts = !findBill ? data.medicines : prescriptionDetailsFilterInserts;

    const prescriptionDetailsInserts = dataInserts.map((t) => {
      const id = generateUUID("PSDI");
      return [
        id,
        data.prescriptions_id,
        t.medicine_id,
        t.quantity_ordered,
        t.note,
        t.amount_use_in_day,
        t.amount_of_medication_per_session,
        t.session,
        null,
      ];
    });

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.update<Partial<Prescription>, Prescription>({
          data: {
            quantity_re_exam: data.quantityReExam,
            date_re_exam: dayjs().add(data.quantityReExam, "days").format("YYYY-MM-DD"),
          },
          pool: connection,
          table: PrescriptionModel.getTable,
          key: "id",
          valueOfKey: data.prescriptions_id,
        }),
        !findBill
          ? transaction.update<Partial<ExaminationCard>, ExaminationCard>({
              data: {
                status: "complete",
              },
              pool: connection,
              table: ExaminationCardModel.getTable,
              key: "id",
              valueOfKey: data.exam_card_id,
            })
          : null,
        !findBill
          ? transaction.update<Partial<Booking>, Booking>({
              data: {
                status: "completed",
              },
              pool: connection,
              table: BookingModel.getTable,
              key: "id",
              valueOfKey: examCard.booking_id,
            })
          : null,
        prescriptionDetailsInserts.length
          ? transaction.createBulk({
              data: prescriptionDetailsInserts,
              pool: connection,
              table: PrescriptionsDetailModel.getTable,
              fillables: PrescriptionsDetailModel.getFillables,
              withId: true,
            })
          : null,
        !findBill
          ? transaction.create<Bill>({
              data: {
                id: generateUUID("BI"),
                examination_card_id: data.exam_card_id,
                payment_for: "medicine",
                status: "unpaid",
                total_price: data.totalCost,
                deposit: 0,
                change: 0,
                note: "",
                price_received: 0,
              },
              pool: connection,
              table: BillModel.getTable,
            })
          : transaction.update<Partial<Bill>, Bill>({
              data: {
                total_price: data.totalCost,
              },
              pool: connection,
              table: BillModel.getTable,
              key: "id",
              valueOfKey: String(findBill.id),
            }),

        ...[
          findBill && prescriptionDetailsFilterUpdate.length
            ? prescriptionDetailsFilterUpdate.map(
                (row) =>
                  new Promise(async (resolve, reject) => {
                    try {
                      await transaction.update<Partial<PrescriptionsDetail>, Bill>({
                        data: {
                          ...row,
                        },
                        pool: connection,
                        table: PrescriptionsDetailModel.getTable,
                        key: "id",
                        valueOfKey: String(row.id),
                      });

                      resolve(true);
                    } catch (error) {
                      await connection.rollback();
                      reject(error);
                    }
                  })
              )
            : [],
        ],
      ]);

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static getById = async (id: number) => {
    const data = await PrescriptionModel.findOne<Prescription>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await PrescriptionModel.findAll<Prescription>(filters, undefined, options);
    const total = await PrescriptionModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Prescription>) => {
    return await PrescriptionModel.findOne<Prescription>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await PrescriptionModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getByExamCardId = async ({ doctorId, examCardId }: GetByExamCardIdQuery) => {
    const response = await PrescriptionService.findOne({
      doctor_id: doctorId,
      exam_card_id: examCardId,
    });

    return response || null;
  };

  static getByExaminationCardId = async ({ examCardId }: GetByExamCardIdQueryV2) => {
    const prescription = await PrescriptionService.findOne({ exam_card_id: examCardId });

    // console.log(`prescription`, { prescription, examCardId });

    if (!prescription) return [];

    const { results } = await PrescriptionsDetailService.getAll(
      { prescriptions_id: String(prescription.id) },
      {}
    );

    const details = results.map((row) => {
      const { medicineData, ...others } = row;

      const { id, ...data } = getInfoData(others, [
        "amount_of_medication_per_session",
        "amount_use_in_day",
        "note",
        "session",
        "quantity_ordered",
        "id",
      ]);

      return {
        ...medicineData,
        ...data,
        prescription_details_id: id,
      };
    });

    const data = { ...prescription, details };

    // console.log(`data`, data);

    return data;
  };

  static receivePrescription = async ({ employeeId, examCardId }: ReceivePrescriptionInput) => {
    const bill = await BillService.findOne({
      examination_card_id: examCardId,
      payment_for: "medicine",
    });

    if (!bill) throw new NotFoundRequestError(`Đã không tìm hóa đơn. Vui lòng thử lại sau`);

    await BillModel.update<Partial<Bill>, Bill>(
      { status: "paid", price_received: bill.total_price, employee_id: employeeId },
      bill.id!,
      "id"
    );

    return true;
  };
}

export default PrescriptionService;
