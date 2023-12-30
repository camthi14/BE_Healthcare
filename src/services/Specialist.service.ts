import { Transaction } from "@/lib";
import { removeImage, resultUrlImage } from "@/lib/cloudinary.lib";
import { Specialist, SpecialistModel } from "@/models";
import { GetDoctorQuery, SpecialistInputCreate, SpecialistInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundRequestError,
  getInfoData,
  rawLike,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import DoctorService from "./Doctor.service";
import ScheduleDoctorService from "./ScheduleDoctor.service";
import dayjs from "dayjs";

type GetDoctorPromise = {};

class SpecialistService {
  static create = async (data: SpecialistInputCreate & { photo?: string }) => {
    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();
      const nameExists = await SpecialistService.findOne({ name: data.name });

      if (nameExists) {
        throw new ConflictRequestError(`Tên chuyên khoa \`${data.name}\` đã tồn tại`);
      }
      const { name, desc, time_chekup_avg, photo } = data;

      await Promise.all([
        transaction.create<Specialist>({
          data: {
            name,
            time_chekup_avg: +time_chekup_avg,
            desc,
            photo: photo ?? null,
            price: +data.price,
          },
          pool: connect,
          table: SpecialistModel.getTable,
        }),
      ]);

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

  static update = async (data: SpecialistInputUpdate["body"] & { photo?: string }, id: number) => {
    //@ts-ignore
    const nameExits = await SpecialistModel.findOne<Specialist>({ name_like: data.name });

    if (nameExits && nameExits.id !== id) {
      throw new ConflictRequestError("Tên chuyên khoa đã tồn tại.");
    }

    const response = await SpecialistService.getById(id);

    if (data?.photo) {
      if (response.photo) await removeImage(response.photo);
    } else {
      delete data.photo;
    }

    const updated = await SpecialistModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await SpecialistModel.findOne<Specialist>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return { ...data, photo: data.photo ? resultUrlImage(data.photo) : null };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await SpecialistModel.findAll<Specialist>(filters, undefined, options);
    const total = await SpecialistModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = results.map((item) => ({
      ...item,
      photo: item.photo ? resultUrlImage(item.photo) : null,
    }));

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Specialist>) => {
    return await SpecialistModel.findOne<Specialist>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await SpecialistModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getDoctor = async ({ date, specialtyId, doctorId, doctorName }: GetDoctorQuery) => {
    const { results } = await SpecialistService.getAll(
      { ...(specialtyId ? { id: specialtyId } : {}) },
      {}
    );

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const { results } = await DoctorService.getAll(
                {
                  speciality_id: row.id,
                  ...(doctorId ? { id: doctorId } : {}),
                  ...(doctorName ? { display_name: rawLike(doctorName) } : {}),
                },
                { order: "display_name" }
              );

              const res = await Promise.all(
                results.map(
                  (doctor) =>
                    new Promise(async (rs, rj) => {
                      try {
                        const schedules = await ScheduleDoctorService.findOne({
                          date: dayjs(new Date(date)).format("YYYY-MM-DD"),
                          doctor_id: String(doctor.id),
                          status: "active",
                        });

                        const { specialty, ...otherDoctor } = doctor;

                        const data = getInfoData(otherDoctor, [
                          "id",
                          "display_name",
                          "email",
                          "phone_number",
                          "photo",
                          "status",
                          "deleted_at",
                          "infoData",
                          "operation",
                          "qualificationData",
                        ]);

                        rs({ ...data, schedules });
                      } catch (error) {
                        rj(error);
                      }
                    })
                )
              );

              resolve({ ...row, doctors: res });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return response;
  };
}

export default SpecialistService;
