import {
  Booking,
  BookingModel,
  HourObject,
  HourObjectModel,
  Notification,
  NotificationModel,
  SaveExpoPushToken,
  ScheduleDoctor,
  ScheduleDoctorModel,
} from "@/models";
import {
  DoctorCancelScheduleInput,
  GetByDoctorAndDateQuery,
  ScheduleDoctorCreateMultipleInput,
  ScheduleDoctorInputCreate,
  ScheduleDoctorInputUpdate,
} from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  InternalServerRequestError,
  NotFoundRequestError,
  dateFormat,
  generateUUID,
  handleCompareTimeWithCurrentTime,
  parserBoolean,
  parserBooleanSQL,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import DoctorService from "./Doctor.service";
import { Transaction } from "@/lib";
import HourObjectService from "./HourObject.service";
import SessionsCheckupService from "./SessionsCheckup.service";
import { format, raw } from "mysql2";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import BookingService from "./Booking.service";
import PatientService from "./Patient.service";
import { NotificationTypes } from "@/constants";
import { ExpoServerSDK } from "@/helpers";
import { SaveExpoPushTokenService } from ".";
import { isNumber } from "lodash";
dayjs.extend(isToday);

type ScheduleDoctorPayload = {
  date: string;
  doctorId: string;
  sessionCheckUpId: number;
  hours: HourObject[];
  scheduleId: string;
};

type ResponsePromise = ScheduleDoctor & {
  doctor: Awaited<ReturnType<typeof DoctorService.getById>>;
  sessions: Awaited<ReturnType<typeof SessionsCheckupService.getById>>;
  hours: Awaited<ReturnType<typeof HourObjectService.getAll>>["results"];
};

class ScheduleDoctorService {
  static createMultiple = async ({ data }: ScheduleDoctorCreateMultipleInput) => {
    const dataNew = await Promise.all(
      data.map(
        (item): Promise<ScheduleDoctorPayload> =>
          new Promise(async (resolve, reject) => {
            try {
              const { doctorId, date, hours } = item;

              const [scheduleExists, doctor] = await Promise.all([
                ScheduleDoctorService.findOne({
                  doctor_id: doctorId,
                  date: date,
                }),
                DoctorService.getById(doctorId),
              ]);

              if (scheduleExists) {
                throw new ConflictRequestError(
                  `Lịch khám ngày \`${date}\` của \`${doctor.display_name}\` đã tồn tại. Vui lòng thay đổi lịch.`
                );
              }

              const scheduleId = generateUUID("S");

              resolve({
                ...item,
                scheduleId,
                hours: hours
                  .filter((h) => !h.is_remove)
                  .filter((h) => !h.is_over_time)
                  .map((h) => ({
                    ...h,
                    is_booked: parserBooleanSQL(h.is_booked),
                    is_cancel: parserBooleanSQL(h.is_cancel),
                    is_remove: parserBooleanSQL(h.is_remove),
                    schedule_doctor_id: scheduleId,
                  })),
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    const schedulesInsert = dataNew.map((item) => [
      item.scheduleId,
      item.sessionCheckUpId,
      item.doctorId,
      item.date,
      "active",
      null,
    ]);

    let initial: HourObject[] = [];

    let newHours = dataNew.reduce(
      (results, { hours }) => (results = [...results, ...hours]),
      initial
    );

    const hoursInsert = newHours.map((t) => [
      t.id,
      t.schedule_doctor_id!,
      t.time_start,
      t.time_end,
      t.is_remove,
      t.is_booked,
      t.is_cancel,
      null,
    ]);

    try {
      await connection.beginTransaction();

      await transaction.createBulk({
        pool: connection,
        // @ts-ignore
        data: schedulesInsert,
        fillables: ScheduleDoctorModel.getFillables,
        table: ScheduleDoctorModel.getTable,
        withId: true,
      });

      await transaction.createBulk({
        pool: connection,
        data: hoursInsert,
        fillables: HourObjectModel.getFillables,
        table: HourObjectModel.getTable,
        withId: true,
      });

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

  static create = async (data: ScheduleDoctorInputCreate) => {
    return await ScheduleDoctorModel.create(data);
  };

  static update = async (data: ScheduleDoctorInputUpdate["body"], id: string) => {
    const { results: getHours } = await HourObjectService.getAll(
      { schedule_doctor_id: id },
      { order: "time_start,asc" }
    );

    let { date, doctorId, hours, sessionCheckUpId } = data;

    const isToday = dayjs(date).isToday();

    const filterHoursUpdate = hours
      .filter((t) => (isNumber(t.is_booked) ? t.is_booked !== 1 : !t.is_booked))
      .filter((t) => (isNumber(t.is_cancel) ? t.is_cancel !== 1 : !t.is_cancel));

    let getHoursOlds = [...getHours.map((t) => ({ ...t, is_over_time: false }))];

    if (isToday) {
      getHoursOlds = getHoursOlds.map((gHO) => {
        const isOverTime = handleCompareTimeWithCurrentTime(gHO.time_start, gHO.time_end);

        return {
          ...gHO,
          is_over_time: isOverTime,
        };
      });
    }

    const removeHour = getHoursOlds
      .filter((t) => (isNumber(t.is_booked) ? t.is_booked !== 1 : !t.is_booked))
      .filter((t) => (isNumber(t.is_cancel) ? t.is_cancel !== 1 : !t.is_cancel))
      .filter((t) => !t.is_over_time)
      .filter((gH) => !filterHoursUpdate.map((h) => h.time_start).includes(gH.time_start));

    // if (removeHour.length) {
    //   await Promise.all(
    //     removeHour.map(
    //       (hour) =>
    //         new Promise(async (resolve, reject) => {
    //           try {
    //             const bookingExist = await BookingService.findOne({ hour_id: hour.id });

    //             if (bookingExist) {
    //               throw new BadRequestError(
    //                 `Ca khám bệnh ${hour.time_start} -  ${hour.time_end} đã có người đặt. Không thể thực hiện cập nhật`
    //               );
    //             }

    //             resolve(true);
    //           } catch (error) {
    //             reject(error);
    //           }
    //         })
    //     )
    //   );
    // }

    const tempGetHours = getHours.map((h) => h.time_start);

    const insertHour = filterHoursUpdate.filter((gH) => !tempGetHours.includes(gH.time_start));

    // console.log(`insertHour`, { insertHour, removeHour });

    // throw new InternalServerRequestError(`Maintain system`);

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      if (insertHour.length) {
        const hoursInsert = insertHour.map((t) => [
          t.id,
          id,
          t.time_start,
          t.time_end,
          t.is_remove,
          t.is_booked,
          t.is_cancel,
          null,
        ]);

        await transaction.createBulk({
          pool: connection,
          data: hoursInsert,
          fillables: HourObjectModel.getFillables,
          table: HourObjectModel.getTable,
          withId: true,
        });
      }

      if (removeHour.length) {
        await Promise.all(
          removeHour.map(
            (hour) =>
              new Promise(async (resolve, reject) => {
                try {
                  await transaction.delete<HourObject>({
                    conditions: { id: hour.id },
                    pool: connection,
                    table: HourObjectModel.getTable,
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

      await transaction.update<Partial<ScheduleDoctor>, ScheduleDoctor>({
        data: {
          date: date,
          doctor_id: doctorId,
          session_checkup_id: sessionCheckUpId,
        },
        key: "id",
        pool: connection,
        table: ScheduleDoctorModel.getTable,
        valueOfKey: id,
      });
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

  static getById = async (id: number) => {
    const data = await ScheduleDoctorModel.findOne<ScheduleDoctor>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ScheduleDoctorModel.findAll<ScheduleDoctor>(filters, undefined, options);
    const total = await ScheduleDoctorModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row): Promise<ResponsePromise> =>
          new Promise(async (resolve, reject) => {
            try {
              const [doctor, hours, sessions] = await Promise.all([
                DoctorService.getById(row?.doctor_id),
                HourObjectService.getAll(
                  { schedule_doctor_id: row.id },
                  { order: "time_start,asc" }
                ),
                SessionsCheckupService.getById(row.session_checkup_id),
              ]);

              const today = dayjs(new Date(row.date)).isToday();

              let hoursObject = hours.results.map((h) => ({
                ...h,
                is_over_time: false,
              }));

              const dataHours = ScheduleDoctorModel.schedulesHour();

              if (today) {
                hoursObject = hoursObject.map((t) => {
                  const isOverTime = handleCompareTimeWithCurrentTime(t.time_start, t.time_end);

                  return {
                    ...t,
                    is_over_time: isOverTime,
                    // is_remove: isOverTime,
                  };
                });
              }

              // console.log(
              //   `hoursObject - ${dayjs(new Date(row.date)).format("DD/MM/YYYY")}`,
              //   hoursObject
              // );

              hoursObject = dataHours.map((t) => {
                const hour = hoursObject.find(
                  (h) => h.time_end === t.time_end && h.time_start === t.time_start
                );

                return hour
                  ? hour
                  : { ...t, schedule_doctor_id: row.id, is_remove: true, is_over_time: false };
              });

              resolve({ ...row, doctor, sessions, hours: hoursObject });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<ScheduleDoctor>) => {
    const response = await ScheduleDoctorModel.findOne<ScheduleDoctor>(conditions);

    if (!response) return null;

    const [{ results: hours }, sessions] = await Promise.all([
      HourObjectService.getAll({ schedule_doctor_id: response.id }, { order: "time_start,asc" }),
      SessionsCheckupService.getById(response.session_checkup_id),
    ]);

    return { ...response, sessions, hours };
  };

  static deleteById = async (id: number) => {
    if (!(await ScheduleDoctorModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getByDoctorAndDates = async ({ dates, doctorId }: GetByDoctorAndDateQuery) => {
    const datesArray = dates.split(",").map((t) => t.trim());

    const sql = format("IN (?)", [datesArray]);

    const response = await ScheduleDoctorService.getAll(
      { doctor_id: doctorId, date: raw(sql), status: "active" },
      {}
    );

    const results = response.results.map(({ doctor, doctor_id, ...othersData }) => {
      const today = dayjs(new Date(othersData.date)).isToday();

      let hours = othersData.hours.map((h) => ({
        ...h,
        is_over_time: false,
      }));

      if (!today) return { ...othersData, hours };

      hours = hours.map((t) => {
        return { ...t, is_over_time: handleCompareTimeWithCurrentTime(t.time_start, t.time_end) };
      });

      const dataHours = ScheduleDoctorModel.schedulesHour();

      hours = dataHours.map((t) => {
        const hour = hours.find((h) => h.time_end === t.time_end && h.time_start === t.time_start);
        return hour ? hour : { ...t, is_remove: true, is_over_time: false };
      });

      return { ...othersData, hours };
    });

    return results;
  };

  static cancelDoctor = async ({ date, doctorId, hourId }: DoctorCancelScheduleInput) => {
    const [booking, hour, doctor] = await Promise.all([
      BookingService.findOne({
        date: date,
        hour_id: hourId,
        status: "waiting",
      }),
      HourObjectService.getById(hourId),
      DoctorService.getById(doctorId),
    ]);

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await Promise.all([
        transaction.update<Partial<HourObject>, Partial<HourObject>>({
          data: { is_cancel: 1 },
          key: "id",
          pool: connection,
          table: HourObjectModel.getTable,
          valueOfKey: hourId,
        }),
      ]);

      if (booking) {
        const patient = await PatientService.getById(booking.patient_id!);

        const body = `Bác sĩ ${doctor.qualificationData?.character} ${
          doctor.display_name
        } đã hủy lịch khám ngày ${dateFormat(date, "DD/MM/YYYY")}, ca khám lúc ${
          hour?.time_start
        } - ${hour?.time_end}. Vui lòng đặt giờ khác.`;

        const notification: Notification = {
          actor_type: "patient",
          body: body,
          title: "Bác sĩ đã hủy lịch",
          entity_id: booking.id!,
          entity_name: BookingModel.getTable,
          user_id: patient.relationship !== "me" ? patient.relatives_id! : patient.id!,
          notification_type: NotificationTypes.DOCTOR_CANCEL,
          is_system: 0,
        };

        await Promise.all([
          transaction.update<Partial<Booking>, Partial<Booking>>({
            data: { status: "doctor_canceled" },
            key: "id",
            pool: connection,
            table: BookingModel.getTable,
            valueOfKey: booking.id!,
          }),
          transaction.create<Notification>({
            data: notification,
            pool: connection,
            table: NotificationModel.getTable,
          }),
        ]);

        let expoPushToken: false | SaveExpoPushToken = false;

        if (patient.relationship !== "me") {
          expoPushToken = await SaveExpoPushTokenService.findOne({
            actor_type: "patient",
            user_id: patient.relatives_id!,
          });
        } else {
          expoPushToken = await SaveExpoPushTokenService.findOne({
            actor_type: "patient",
            user_id: patient.id!,
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
}

export default ScheduleDoctorService;
