import { Transaction } from "@/lib";
import { resultUrlImage } from "@/lib/cloudinary.lib";
import {
  Bill,
  BillModel,
  BillStatus,
  Booking,
  BookingModel,
  BookingStatus,
  BookingsImage,
  Doctor,
  ExaminationCard,
  ExaminationCardModel,
  ExaminationCardOptions,
  ExaminationCardStatus,
  ExaminationCardsDetail,
  ExaminationCardsDetailModel,
  HourObject,
  Patient,
  PatientInfo,
  PrescriptionModel,
  QualifiedDoctor,
  ServiceModel,
  SubclinicalModel,
} from "@/models";
import {
  ConfirmExaminationInput,
  ExaminationCardInputCreate,
  ExaminationCardInputUpdate,
  GetExaminationCardDetailsQuery,
  GetPatientForDateQuery,
  GetRequiredQuery,
  PaymentInput,
  RequiredExaminationInput,
  ServiceExaminationCreateInput,
} from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundRequestError,
  generateUUID,
  getInfoData,
} from "@/utils";
import dayjs from "dayjs";
import { raw } from "mysql2";
import { ObjectType, Pagination } from "types";
import BillService from "./Bill.service";
import BookingService from "./Booking.service";
import BookingsImageService from "./BookingsImage.service";
import DoctorService from "./Doctor.service";
import EmployeeService from "./Employee.service";
import ExaminationCardsDetailService from "./ExaminationCardsDetail.service";
import HourObjectService from "./HourObject.service";
import PatientService from "./Patient.service";
import ServiceService from "./Service.service";

type GetPatientForDateResponse = Pick<
  Booking,
  "id" | "reason" | "order" | "created_at" | "type_patient"
> & {
  doctor: Pick<Doctor, "display_name" | "id"> & { qualificationData: QualifiedDoctor };
  patient: Pick<Patient, "patient_type_id" | "email" | "display_name" | "id" | "phone_number"> & {
    infoData: PatientInfo;
  };
  dataHour?: HourObject;
  bill?: Bill | null;
  examinationData?: ExaminationCard;
  billMedicine?: Bill | null;
  billSubclinical?: Bill[];
  imagesData: BookingsImage[];
};

class ExaminationCardService {
  static create = async (data: ExaminationCardInputCreate) => {
    const [exists, booking] = await Promise.all([
      ExaminationCardService.findOne({ booking_id: data.booking_id }),
      BookingService.findOne({ id: data.booking_id }),
    ]);

    if (exists) {
      throw new ConflictRequestError(`Người bệnh đã được xác nhận.`);
    }

    if (!booking) throw new NotFoundRequestError("Không tìm thấy thông tin đặt khám");

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();
      const examinationId = generateUUID(`EX`);

      await Promise.all([
        transaction.update<Partial<Booking>, Partial<Booking>>({
          data: {
            status: "in_progress",
          },
          key: "id",
          pool: connection,
          table: BookingModel.getTable,
          valueOfKey: data.booking_id,
        }),
        transaction.create<ExaminationCard>({
          data: {
            booking_id: data.booking_id,
            note: "",
            order: data.order ?? 0,
            artery: data.artery,
            blood_pressure: data.blood_pressure,
            breathing_rate: data.breathing_rate,
            id: examinationId,
            is_use_service: data.is_use_service,
            spO2: data.spO2,
            status: "in_progress",
            temperature: data.temperature,
            under_blood_pressure: data.under_blood_pressure,
            options: "service",
          },
          pool: connection,
          table: ExaminationCardModel.getTable,
        }),
      ]);

      const billId = generateUUID("BI");

      await transaction.create<Bill>({
        data: {
          booking_id: data.booking_id,
          employee_id: data.employee_id,
          examination_card_id: examinationId,
          payment_for: "cost_exam",
          status: "unpaid",
          total_price: booking.price!,
          change: 0,
          deposit: 0,
          id: billId,
          note: "",
          price_received: 0,
        },
        pool: connection,
        table: BillModel.getTable,
      });

      return { examinationId, billId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static addServiceConfirm = async ({
    data,
    examination_card_id,
    bill_id,
    booking_id,
    options,
    service_id,
  }: ServiceExaminationCreateInput) => {
    const booking = await BookingService.getById(booking_id);

    let totalPrice: number = 0;

    if (options === "service") {
      const service = await ServiceService.getById(service_id);
      totalPrice = service.price + booking.price!;
    } else {
      totalPrice = data.reduce((t, v) => (t += v.price), 0) + booking.price!;
    }

    let insertBulkSubclinical: any[] = [];

    if (options === "subclinical" && data.length) {
      insertBulkSubclinical = data.map((t) => {
        const examinationCardDetailsId = generateUUID("EDI");
        return [
          examinationCardDetailsId,
          examination_card_id,
          SubclinicalModel.getTable,
          `${t.id}`,
          null,
          "required",
          null,
        ];
      });
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.update<Partial<Bill>, Partial<Bill>>({
          data: {
            total_price: totalPrice,
          },
          key: "id",
          pool: connection,
          table: BillModel.getTable,
          valueOfKey: bill_id,
        }),
        transaction.update<Partial<ExaminationCard>, Partial<ExaminationCard>>({
          data: { options },
          key: "id",
          pool: connection,
          table: ExaminationCardModel.getTable,
          valueOfKey: examination_card_id,
        }),
      ]);

      if (options === "service") {
        await transaction.create<ExaminationCardsDetail>({
          data: {
            examination_card_id,
            service_entity: ServiceModel.getTable,
            service_value: `${service_id}`,
            id: generateUUID("EDI"),
            status: "required",
          },
          pool: connection,
          table: ExaminationCardsDetailModel.getTable,
        });
      }

      if (options === "subclinical") {
        await transaction.createBulk({
          data: insertBulkSubclinical,
          fillables: ExaminationCardsDetailModel.getFillables,
          withId: true,
          pool: connection,
          table: ExaminationCardsDetailModel.getTable,
        });
      }

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

  static update = async (data: ExaminationCardInputUpdate["body"], id: number) => {
    let ExaminationCard: ExaminationCard | boolean;

    if (!(await ExaminationCardModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await ExaminationCardModel.findOne<ExaminationCard>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await ExaminationCardModel.findAll<ExaminationCard>(
      filters,
      undefined,
      options
    );
    const total = await ExaminationCardModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const [dataBooking] = await Promise.all([BookingService.getById(row.booking_id!)]);
              resolve({ ...row, dataBooking });
            } catch (error) {
              reject(error);
            }
          })
      )
    );
    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<ExaminationCard>) => {
    return await ExaminationCardModel.findOne<ExaminationCard>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await ExaminationCardModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getInformationPatient = async (bookingId: string) => {
    const [booking, bill] = await Promise.all([
      BookingService.findOne({
        id: bookingId,
        status: "in_progress",
      }),
      BillService.findOne({ booking_id: bookingId }),
    ]);

    if (!booking || !bill) throw new NotFoundRequestError(`Không tìm thấy thông tin đặt khám.`);

    const hour = await HourObjectService.getById(booking.hour_id);

    const dataDoctor = await DoctorService.getById(booking.doctor_id);
    const dataEmployee = await EmployeeService.getById(bill.employee_id!);

    const [
      {
        display_name,
        phone_number,
        infoData: { birth_date, gender },
      },
      examinationCard,
    ] = await Promise.all([
      PatientService.getById(booking.patient_id),
      ExaminationCardService.findOne({ booking_id: bookingId }),
    ]);

    if (!examinationCard) {
      throw new NotFoundRequestError(`Không tìm thấy thông tin phiếu khám.`);
    }

    const patient = { id: booking.patient_id, display_name, phone_number, birth_date, gender };

    const examinationCardDetails = await ExaminationCardsDetailService.getByStatus({
      examinationCardId: examinationCard.id!,
      options: examinationCard.options,
    });

    return {
      bill: { ...bill, dataEmployee: dataEmployee },
      patient,
      examinationCard,
      examinationCardDetails,
      booking: { ...booking, dataHour: hour, dataDoctor: dataDoctor },
    };
  };

  static payment = async ({
    booking_id,
    change,
    deposit,
    price_received,
    total,
    bill_id,
  }: PaymentInput) => {
    const [bill, examinationCard] = await Promise.all([
      BillService.findOne({ booking_id, id: bill_id }),
      ExaminationCardService.findOne({ booking_id }),
    ]);

    if (!bill || !examinationCard) {
      throw new NotFoundRequestError(`Chưa xác nhận đã đến khám...`);
    }

    let billStatus: BillStatus = "unpaid",
      bookingStatus: BookingStatus = "in_progress",
      examinationCardStatus: ExaminationCardStatus = "in_progress";

    if (price_received >= total) {
      billStatus = "paid";
      examinationCardStatus = "pending";
    }

    if (deposit > 0) {
      billStatus = "partially_paid";
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.update<Partial<Booking>, Partial<Booking>>({
          data: { status: bookingStatus },
          key: "id",
          pool: connection,
          table: BookingModel.getTable,
          valueOfKey: booking_id,
        }),
        transaction.update<Partial<Bill>, Partial<Bill>>({
          data: { status: billStatus, change, deposit, price_received },
          key: "id",
          pool: connection,
          table: BillModel.getTable,
          valueOfKey: bill_id,
        }),
        transaction.update<Partial<ExaminationCard>, Partial<ExaminationCard>>({
          data: { status: examinationCardStatus },
          key: "booking_id",
          pool: connection,
          table: ExaminationCardModel.getTable,
          valueOfKey: booking_id,
        }),
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

  static getPatientForDate = async ({
    date,
    bookingStatus,
    doctorId,
    examinationStatus,
  }: GetPatientForDateQuery): Promise<GetPatientForDateResponse[]> => {
    const dateFormat = dayjs(new Date(date)).format("YYYY-MM-DD");

    const bookings = await BookingService.getAll(
      { date: dateFormat, status: bookingStatus, ...(doctorId ? { doctor_id: doctorId } : {}) },
      { order: "created_at,asc" }
    );

    // console.log(`bookings`, bookings);

    const examinations = await Promise.all(
      bookings.results.map(
        (row): Promise<GetPatientForDateResponse | undefined> =>
          new Promise(async (resolve, reject) => {
            try {
              const examinationData = await ExaminationCardService.findOne({
                booking_id: row.id,
                status: examinationStatus,
              });

              if (!examinationData) {
                return resolve(undefined);
              }

              const { results: images } = await BookingsImageService.getAll(
                { booking_id: row.id },
                {}
              );

              const imagesData = images.map((t) => ({ ...t, url: resultUrlImage(t.url) }));

              const {
                order,
                dataDoctor,
                type_patient,
                reason,
                dataPatient,
                created_at,
                dataHour,
                bill,
                id,
                billMedicine,
                billSubclinical,
              } = getInfoData(row, [
                "order",
                "dataPatient",
                "dataDoctor",
                "dataHour",
                "bill",
                "billMedicine",
                "billSubclinical",
                "id",
                "created_at",
                "reason",
                "type_patient",
              ]);

              const { display_name, id: doctorId, qualificationData } = dataDoctor!;
              const {
                display_name: patientFullName,
                id: patientId,
                phone_number: pnPatient,
                patient_type_id,
                email,
                infoData,
              } = dataPatient!;

              resolve({
                id,
                reason: reason!,
                order,
                doctor: { display_name, id: doctorId, qualificationData },
                patient: {
                  patient_type_id,
                  email,
                  display_name: patientFullName,
                  id: patientId,
                  phone_number: pnPatient,
                  infoData,
                },
                dataHour,
                bill,
                examinationData,
                created_at,
                type_patient: type_patient!,
                billMedicine,
                billSubclinical,
                imagesData,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return examinations.filter((t) => t) as GetPatientForDateResponse[];
  };

  static confirmExamination = async ({ examinationId, doctorId }: ConfirmExaminationInput) => {
    const response = await ExaminationCardService.getPatientForDate({
      bookingStatus: "in_progress",
      date: dayjs().format("YYYY-MM-DD"),
      examinationStatus: "examination",
      doctorId,
    });

    if (response.length) {
      const options = response
        .map((r) => r?.examinationData?.options)
        .reduce(
          (text, value, idx, old) => (text += `${value}${idx >= old.length - 1 ? "" : ","}`),
          ""
        );

      if (!options.match(/doctor/)) {
        throw new ConflictRequestError(`Đang có bệnh nhân đang khám. Không được phép tiếp nhận.`);
      }
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.update<Partial<ExaminationCard>, Partial<ExaminationCard>>({
          data: { status: "examination" },
          key: "id",
          pool: connection,
          table: ExaminationCardModel.getTable,
          valueOfKey: examinationId,
        }),
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

  static requiredExaminationSubclinical = async ({
    data,
    doctorId,
    examinationCardId,
  }: RequiredExaminationInput) => {
    const examination = await ExaminationCardService.getById(examinationCardId);

    const totalCost = data.reduce((total, value) => (total += value.price), 0);
    const insertBulkSubclinical = data.map((t) => {
      const examinationCardDetailsId = generateUUID("EDI");

      return [
        examinationCardDetailsId,
        examinationCardId,
        SubclinicalModel.getTable,
        `${t.id}`,
        doctorId,
        "required",
        null,
      ];
    });

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    let option: ExaminationCardOptions = examination.options;

    if (option === "service") {
      option = "doctor.service";
    }

    if (option === "subclinical") {
      option = "doctor.subclinical";
    }

    try {
      await connection.beginTransaction();

      const billId = generateUUID("BI");

      await Promise.all([
        transaction.update<Partial<ExaminationCard>, ExaminationCard>({
          data: { options: option },
          key: "id",
          pool: connection,
          table: ExaminationCardModel.getTable,
          valueOfKey: examinationCardId,
        }),
        transaction.create<Bill>({
          data: {
            id: billId,
            examination_card_id: examinationCardId,
            payment_for: "cost_cls",
            status: "unpaid",
            total_price: totalCost,
            change: 0,
            deposit: 0,
            note: "",
            price_received: 0,
          },
          pool: connection,
          table: BillModel.getTable,
        }),
        transaction.createBulk({
          data: insertBulkSubclinical,
          fillables: ExaminationCardsDetailModel.getFillables,
          withId: true,
          pool: connection,
          table: ExaminationCardsDetailModel.getTable,
        }),
      ]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    const response = await ExaminationCardService.getRequiredByDoctor({
      doctorId,
      examinationCardId: examinationCardId,
      status: "required",
    });

    return response;
  };

  static getRequiredByDoctor = async ({
    doctorId,
    examinationCardId,
    status,
  }: GetRequiredQuery) => {
    const { options } = await ExaminationCardService.getById(examinationCardId);

    const response = await ExaminationCardsDetailService.getByStatus({
      examinationCardId,
      options,
      doctorId,
      status,
    });

    return response;
  };

  static getExaminationForDate = async ({ date, bookingStatus }: GetPatientForDateQuery) => {
    const dateFormat = dayjs(new Date(date)).format("YYYY-MM-DD");

    const bookings = await BookingService.getAll(
      { date: dateFormat, status: bookingStatus },
      { order: "created_at,asc" }
    );

    const examinations = await Promise.all(
      bookings.results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const examinationData = await ExaminationCardService.findOne({
                booking_id: row.id,
                options: raw(`<> 're_examination'`),
              });

              if (!examinationData) return resolve(undefined);

              const { order, dataDoctor, reason, dataPatient, created_at, dataHour, bill, id } =
                getInfoData(row, [
                  "order",
                  "dataPatient",
                  "dataDoctor",
                  "dataHour",
                  "bill",
                  "id",
                  "created_at",
                  "reason",
                ]);

              const { display_name, id: doctorId, qualificationData } = dataDoctor!;
              const {
                display_name: patientFullName,
                id: patientId,
                phone_number: pnPatient,
                patient_type_id,
                email,
                infoData,
              } = dataPatient!;

              resolve({
                id,
                reason: reason!,
                order,
                doctor: { display_name, id: doctorId, qualificationData },
                patient: {
                  patient_type_id,
                  email,
                  display_name: patientFullName,
                  id: patientId,
                  phone_number: pnPatient,
                  infoData,
                },
                dataHour,
                bill,
                examinationData,
                created_at,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return examinations.filter((t) => t) as GetPatientForDateResponse[];
  };

  static getExaminationCardDetails = async ({
    examinationCardId,
  }: GetExaminationCardDetailsQuery) => {
    const examinationCard = await ExaminationCardService.getById(examinationCardId);

    const { results } = await ExaminationCardsDetailService.getAll(
      { examination_card_id: examinationCardId },
      { order: "created_at,asc" }
    );

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              if (!row.doctor_id) return resolve({ ...row, doctorName: "" });

              const doctor = await DoctorService.getById(row.doctor_id!);

              resolve({ ...row, doctorName: doctor.display_name });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return response;
  };

  static getExaminationByBookingId = async (bookingId: string) => {
    const response = await ExaminationCardService.findOne({ booking_id: bookingId });
    const booking = await BookingService.findOne({ id: bookingId });

    if (!booking) throw new NotFoundRequestError(`Không tìm thấy dữ liệu`);

    const [dataPatient, dataDoctor, dataHour] = await Promise.all([
      PatientService.getById(booking.patient_id!),
      DoctorService.getById(booking.doctor_id!),
      HourObjectService.getById(booking.hour_id!),
    ]);

    const resultsBooking = {
      ...booking,
      dataPatient,
      dataDoctor,
      dataHour,
      billExists: false,
      detailsExists: false,
      prescriptionExists: false,
    };

    if (!response) return { booking: resultsBooking, examCard: null, bills: [] };

    const billExists = await BillModel.count({ examination_card_id: response.id! });
    const details = await ExaminationCardsDetailModel.count({ examination_card_id: response.id! });
    const prescriptionExists = await PrescriptionModel.count({ exam_card_id: response.id! });

    return {
      booking: resultsBooking,
      examCard: response,
      billExists: billExists > 0,
      detailsExists: details > 0,
      prescriptionExists: prescriptionExists > 0,
    };
  };
}

export default ExaminationCardService;
