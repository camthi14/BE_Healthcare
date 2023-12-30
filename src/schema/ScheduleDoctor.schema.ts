import { boolean, number, object, string, TypeOf } from "zod";

export const ScheduleDoctorCreateSchema = object({
  body: object({
    session_checkup_id: string({
      required_error: "session_checkup_id là trường bắt buộc",
    }),
    date: string({
      required_error: "date là trường bắt buộc",
    }),
  }),
});

export const ScheduleDoctorCreateMultipleSchema = object({
  body: object({
    data: object({
      date: string().nonempty(),
      doctorId: string().nonempty(),
      sessionCheckUpId: number().min(1),
      hours: object({
        id: string().nonempty(),
        time_start: string().nonempty(),
        schedule_doctor_id: string().optional(),
        time_end: string().nonempty(),
        is_booked: boolean(),
        is_remove: boolean(),
        is_cancel: boolean(),
        is_over_time: boolean().optional(),
      })
        .array()
        .nonempty(),
    })
      .array()
      .nonempty(),
  }),
});

export const DoctorCancelScheduleSchema = object({
  body: object({
    date: string().nonempty(),
    hourId: string().nonempty(),
    doctorId: string().nonempty(),
  }),
});

export const ScheduleDoctorUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    date: string().nonempty(),
    doctorId: string().nonempty(),
    sessionCheckUpId: number().min(1),
    hours: object({
      id: string().nonempty(),
      time_start: string().nonempty(),
      schedule_doctor_id: string().optional(),
      time_end: string().nonempty(),
      is_booked: boolean(),
      is_remove: boolean(),
      is_cancel: boolean(),
      is_over_time: boolean().optional(),
    })
      .array()
      .nonempty(),
  }),
});

export const GetByDoctorAndDateSchema = object({
  query: object({
    doctorId: string().nonempty(),
    dates: string().nonempty(),
  }),
});

export type ScheduleDoctorInputCreate = TypeOf<typeof ScheduleDoctorCreateSchema>["body"];

export type DoctorCancelScheduleInput = TypeOf<typeof DoctorCancelScheduleSchema>["body"];

export type ScheduleDoctorInputUpdate = TypeOf<typeof ScheduleDoctorUpdateSchema>;

export type GetByDoctorAndDateQuery = TypeOf<typeof GetByDoctorAndDateSchema>["query"];

export type ScheduleDoctorCreateMultipleInput = TypeOf<
  typeof ScheduleDoctorCreateMultipleSchema
>["body"];
