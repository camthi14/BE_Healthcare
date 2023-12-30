import { NotificationTypes } from "@/constants";
import { SocketEventsName } from "@/constants/socket.contants";
import { ExpoServerSDK } from "@/helpers";
import { Transaction } from "@/lib";
import {
  Bill,
  Booking,
  BookingModel,
  BookingsImageModel,
  ExaminationCard,
  HourObject,
  HourObjectModel,
  Notification,
  NotificationModel,
  SaveExpoPushToken,
} from "@/models";
import { BookingDesktopInput, BookingInputCreate, BookingInputUpdate } from "@/schema";
import {
  BadRequestError,
  NotFoundRequestError,
  dateFormat,
  generateUUID,
  handleCompareTimeWithCurrentTime,
} from "@/utils";
import dayjs from "dayjs";
import { Server } from "socket.io";
import { ObjectType, Pagination } from "types";
import BillService from "./Bill.service";
import DoctorService from "./Doctor.service";
import ExaminationCardService from "./ExaminationCard.service";
import HourObjectService from "./HourObject.service";
import PatientService from "./Patient.service";
import SaveExpoPushTokenService from "./SaveExpoPushToken.service";
import SpecialistService from "./Specialist.service";
import { raw } from "mysql2";

export type GetAllBookingResponse = {
  dataPatient: Awaited<ReturnType<typeof PatientService.getById>>;
  dataDoctor: Awaited<ReturnType<typeof DoctorService.getById>>;
  dataHour: Awaited<ReturnType<typeof HourObjectService.getById>>;
  bill: Bill | null;
  billMedicine: Bill | null;
  billSubclinical: Bill[];
  examCard: ExaminationCard | null;
} & Booking;

type BookingMobileState = {
  patientId: string;
  hourId: string;
  doctorId: string;
  reason: string;
  date: string;
  price: number;
  order: number;
  images?: string[];
};

type GetHistoryState = Awaited<ReturnType<typeof BookingService.getAll>>["results"];

class BookingService {
  static create = async (data: BookingInputCreate) => {
    return await BookingModel.create(data);
  };

  static bookingDesktop = async (data: BookingDesktopInput) => {
    const {
      date,
      doctorId,
      employeeId,
      hourId,
      isReExamination,
      specialtyId,
      patientId,
      reason,
      order,
    } = data;

    const transaction = new Transaction();
    const [connection, { price }] = await Promise.all([
      transaction.getPoolTransaction(),
      SpecialistService.getById(+specialtyId),
    ]);

    try {
      await connection.beginTransaction();

      const bookingId = generateUUID("BID");

      // TODO: Notifications, SocketIO

      await Promise.all([
        transaction.create<Booking>({
          data: {
            date,
            doctor_id: doctorId,
            hour_id: hourId,
            patient_id: patientId,
            reason,
            type_patient: isReExamination ? "re_examination" : "new",
            actor_booking_type: "Employees",
            actor_booking_value: employeeId,
            id: bookingId,
            note: "",
            price: price,
            order,
          },
          pool: connection,
          table: BookingModel.getTable,
        }),
        transaction.update<Partial<HourObject>, Partial<HourObject>>({
          data: { is_booked: 1 },
          key: "id",
          pool: connection,
          table: HourObjectModel.getTable,
          valueOfKey: hourId,
        }),
      ]);

      return bookingId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static update = async (data: BookingInputUpdate["body"], id: number) => {
    let Booking: Booking | boolean;

    if (!(await BookingModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await BookingModel.findOne<Booking>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const [dataPatient, dataDoctor, dataHour, bill] = await Promise.all([
      PatientService.getById(data.patient_id),
      DoctorService.getById(data.doctor_id),
      HourObjectService.findOne({ id: data.hour_id }),
      BillService.findOne({ booking_id: data.id, payment_for: "cost_exam" }),
    ]);

    return {
      ...data,
      dataPatient,
      dataDoctor,
      dataHour,
      bill,
    };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await BookingModel.findAll<Booking>(filters, undefined, options);
    const total = await BookingModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row): Promise<GetAllBookingResponse> =>
          new Promise(async (resolve, reject) => {
            try {
              const examCard = await ExaminationCardService.findOne({ booking_id: row.id });

              const [
                dataPatient,
                dataDoctor,
                dataHour,
                bill,
                billMedicine,
                { results: billSubclinical },
              ] = await Promise.all([
                PatientService.getById(row.patient_id!),
                DoctorService.getById(row.doctor_id!),
                HourObjectService.getById(row.hour_id!),
                BillService.findOne({
                  ...(examCard ? { examination_card_id: examCard.id } : { booking_id: row.id }),
                  payment_for: "cost_exam",
                }),
                BillService.findOne({
                  ...(examCard ? { examination_card_id: examCard.id } : { booking_id: row.id }),
                  payment_for: "medicine",
                }),
                BillService.getAll(
                  {
                    ...(examCard ? { examination_card_id: examCard.id } : { booking_id: row.id }),
                    payment_for: "cost_cls",
                  },
                  {}
                ),
              ]);

              resolve({
                ...row,
                dataPatient,
                dataDoctor,
                dataHour,
                bill: bill || null,
                billMedicine: billMedicine || null,
                billSubclinical: billSubclinical as Bill[],
                examCard: examCard || null,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<Booking>) => {
    return await BookingModel.findOne<Booking>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await BookingModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static bookingMobile = async (payload: BookingMobileState) => {
    let [hour, patient, doctor, booking, expoPushToken, bookingExist, countBookingCancel] =
      await Promise.all([
        HourObjectService.findOne({ id: payload.hourId, is_booked: 0, is_remove: 0, is_cancel: 0 }),
        PatientService.findOne({ id: payload.patientId }),
        DoctorService.getById(payload.doctorId),
        BookingService.findOne({ patient_id: payload.patientId, status: "completed" }),
        SaveExpoPushTokenService.findOne({ actor_type: "patient", user_id: payload.patientId }),
        BookingService.findOne({
          patient_id: payload.patientId,
          status: raw(`IN ('completed', 'waiting', 'in_progress', 'paid', 'examination')`),
          date: payload.date,
        }),
        BookingModel.count({
          patient_id: payload.patientId,
          status: "canceled",
          date: payload.date,
          hour_id: payload.hourId,
          doctor_id: payload.doctorId,
        }),
      ]);

    if (countBookingCancel >= 2) {
      throw new NotFoundRequestError(
        `Ca khám này bạn đã hủy lịch 2 lần trước đó. Bạn không được phép đặt tiếp tục`
      );
    }

    if (bookingExist) {
      throw new NotFoundRequestError(
        `Bạn đã có lịch đặt trong ngày ${dateFormat(payload.date, "DD/MM/YYYY")}`
      );
    }

    if (!hour) {
      throw new NotFoundRequestError(
        `Khung giờ bạn chọn không tồn tại. Vui lòng chọn khung giờ khác`
      );
    }

    if (!patient || !doctor) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra. Vui lòng thử lại sau`);
    }

    const isToday = dayjs(new Date(payload.date)).isToday();

    if (isToday) {
      const isOverTime = handleCompareTimeWithCurrentTime(hour.time_start, hour.time_end);
      if (isOverTime) {
        throw new NotFoundRequestError(
          `Khung giờ ${hour.time_start} - ${hour.time_end} Đã quá thời gian. Vui lòng chọn thời gian khác`
        );
      }
    }

    const bookingId = generateUUID("BID");
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.create<Booking>({
          data: {
            id: bookingId,
            date: dateFormat(payload.date),
            doctor_id: payload.doctorId,
            hour_id: payload.hourId,
            patient_id: payload.patientId,
            reason: payload.reason,
            type_patient: booking ? "re_examination" : "new",
            order: payload.order,
            status: "waiting",
            price: payload.price,
          },
          pool: connection,
          table: BookingModel.getTable,
        }),
        transaction.update<Partial<HourObject>, Partial<HourObject>>({
          data: { is_booked: 1 },
          key: "id",
          pool: connection,
          table: HourObjectModel.getTable,
          valueOfKey: payload.hourId,
        }),
      ]);

      if (payload.images?.length) {
        const imageInserts = payload.images.map((url) => {
          const imageId = generateUUID("BIMG");
          return [imageId, bookingId, url, null];
        });
        await transaction.createBulk({
          data: imageInserts,
          fillables: BookingsImageModel.getFillables,
          pool: connection,
          table: BookingsImageModel.getTable,
          withId: true,
        });
      }

      const body = `Bạn đã đặt lịch thành công. Ngày ${dateFormat(
        payload.date,
        "DD/MM/YYYY"
      )}, ca khám lúc ${hour.time_start} - ${hour.time_end}. Bác sĩ ${
        doctor.qualificationData.character
      } ${doctor.display_name}`;

      const notification: Notification = {
        actor_type: "patient",
        body: body,
        title: "Đặt lịch thành công.",
        entity_id: bookingId,
        entity_name: BookingModel.getTable,
        user_id: patient.relationship !== "me" ? patient.relatives_id! : payload.patientId,
        notification_type: NotificationTypes.BOOKING_SUCCESS,
        is_system: 0,
      };

      await transaction.create<Notification>({
        data: notification,
        pool: connection,
        table: NotificationModel.getTable,
      });

      if (patient.relationship !== "me") {
        expoPushToken = await SaveExpoPushTokenService.findOne({
          actor_type: "patient",
          user_id: patient.relatives_id!,
        });
      }

      if (expoPushToken) {
        const expo = new ExpoServerSDK();
        await expo.pushToken({
          to: expoPushToken.expo_push_token!,
          body: notification.body,
          title: notification.title,
          sound: "default",
        });
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return bookingId;
  };

  static getAllMobile = async (patientId: string, date?: string) => {
    const { results: relationship } = await PatientService.getAll(
      { relatives_id: patientId },
      { order: "relationship" }
    );

    const dateQuery = date ? dateFormat(date, "YYYY-MM-DD") : null;

    let booking: GetHistoryState = [];

    if (relationship.length) {
      const bookingRelationship = await Promise.all(
        relationship.map(
          (row): Promise<GetHistoryState> =>
            new Promise(async (resolve, reject) => {
              try {
                const { results } = await BookingService.getAll(
                  { patient_id: row.id, ...(dateQuery ? { date: dateQuery } : {}) },
                  { limit: 9999, order: "created_at,asc" }
                );
                resolve(results);
              } catch (error) {
                reject(error);
              }
            })
        )
      );
      const init: GetHistoryState = [];

      const convert = bookingRelationship.reduce(
        (results, v) => (results = [...results, ...v]),
        init
      );

      booking = [...booking, ...convert];
    }

    const { results } = await BookingService.getAll(
      { patient_id: patientId, ...(dateQuery ? { date: dateQuery } : {}) },
      { limit: 9999, order: "created_at,asc" }
    );

    booking = [...booking, ...results].sort(
      (a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    );

    return booking;
  };

  static cancel = async (bookingId: string) => {
    const booking = await BookingService.getById(bookingId);

    const isToday = dayjs(new Date(booking.date)).isToday();

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    const body = `Bạn đã hủy lịch thành công. Ngày ${dateFormat(
      booking.date,
      "DD/MM/YYYY"
    )}, ca khám lúc ${(booking!.dataHour as HourObject)?.time_start} - ${
      (booking!.dataHour as HourObject)?.time_end
    }. Bác sĩ ${booking?.dataDoctor.qualificationData.character} ${
      booking?.dataDoctor.display_name
    }`;

    const notification: Notification = {
      actor_type: "patient",
      body: body,
      title: "Hủy lịch thành công.",
      entity_id: bookingId,
      entity_name: BookingModel.getTable,
      user_id:
        booking.dataPatient.relationship !== "me"
          ? booking.dataPatient.relatives_id!
          : booking.dataPatient.id!,
      notification_type: NotificationTypes.BOOKING_CANCEL,
      is_system: 0,
    };

    try {
      if (isToday) {
        const isOverTime = handleCompareTimeWithCurrentTime(
          (booking!.dataHour as HourObject).time_start,
          (booking!.dataHour as HourObject).time_end,
          -60 // 1h
        );

        if (isOverTime) {
          throw new BadRequestError(`Đã hết thời gian hủy. Hủy lịch thất bại`);
        }
      }

      await Promise.all([
        transaction.update<Partial<HourObject>, Partial<HourObject>>({
          data: { is_booked: 0 },
          key: "id",
          pool: connection,
          table: HourObjectModel.getTable,
          valueOfKey: booking.hour_id,
        }),
        transaction.update<Partial<Booking>, Partial<Booking>>({
          data: { status: "canceled" },
          key: "id",
          pool: connection,
          table: BookingModel.getTable,
          valueOfKey: bookingId,
        }),
        await transaction.create<Notification>({
          data: notification,
          pool: connection,
          table: NotificationModel.getTable,
        }),
      ]);

      let expoPushToken: false | SaveExpoPushToken = false;

      if (booking.dataPatient.relationship !== "me") {
        expoPushToken = await SaveExpoPushTokenService.findOne({
          actor_type: "patient",
          user_id: booking.dataPatient.relatives_id!,
        });
      } else {
        expoPushToken = await SaveExpoPushTokenService.findOne({
          actor_type: "patient",
          user_id: booking.dataPatient.id!,
        });
      }

      if (expoPushToken) {
        const expo = new ExpoServerSDK();
        await expo.pushToken({
          to: expoPushToken.expo_push_token!,
          body: notification.body,
          title: notification.title,
          sound: "default",
        });
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return true;
  };

  static confirmExamBeforeOneDay = async (socketIO: Server) => {
    // nextDate = currentDate + 1;
    const nextDate = dayjs().add(1, "day");

    const { results } = await BookingService.getAll(
      { date: nextDate.format("YYYY-MM-DD"), status: "waiting" },
      { order: "created_at,asc" }
    );

    if (!results.length) return;

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all(
        results.map(
          (row) =>
            new Promise(async (resolve, reject) => {
              try {
                const { dataHour: hour, dataDoctor: doctor, dataPatient: patient } = row;

                const body = `Ngày mai bệnh nhân ${patient.display_name} có ca khám lúc ${hour.time_start} - ${hour.time_end}. Bác sĩ ${doctor.qualificationData.character} ${doctor.display_name}. Vui lòng đến trước giờ hẹn 10 phút`;

                const notificationData: Notification = {
                  actor_type: "patient",
                  body: body,
                  title: "Nhắc lịch hẹn.",
                  entity_id: row.id!,
                  entity_name: BookingModel.getTable,
                  user_id: patient.relationship !== "me" ? patient.relatives_id! : patient.id!,
                  notification_type: NotificationTypes.BOOKING_CONFIRM,
                  is_system: 0,
                };

                console.log(`notification`, notificationData);

                await transaction.create<Notification>({
                  data: notificationData,
                  pool: connection,
                  table: NotificationModel.getTable,
                });

                const patientId =
                  patient.relationship !== "me" ? patient.relatives_id! : patient.id!;

                const expoPushToken = await SaveExpoPushTokenService.findOne({
                  actor_type: "patient",
                  user_id: patientId,
                });

                socketIO.to(`${patientId}`).emit(SocketEventsName.NOTIFICATION, notificationData);
                socketIO
                  .to(`${patientId}`)
                  .emit(SocketEventsName.GET_COUNT_NOTIFICATION, notificationData);

                if (expoPushToken) {
                  const expo = new ExpoServerSDK();
                  await expo.pushToken({
                    to: expoPushToken.expo_push_token!,
                    body: notificationData.body,
                    title: notificationData.title,
                    sound: "default",
                  });
                }

                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        )
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return;
  };

  static getByHourId = async (hourId: string) => {
    const response = await BookingService.getAll({ hour_id: hourId }, {});
    if (!response.results.length) return null;
    return response.results[0];
  };
}

export default BookingService;
