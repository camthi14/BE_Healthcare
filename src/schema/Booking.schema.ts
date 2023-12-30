import { boolean, number, object, string, TypeOf } from "zod";

export const BookingCreateSchema = object({
  body: object({
    patient_id: string({
      required_error: "patient_id là trường bắt buộc",
    }),
    doctor_id: string({
      required_error: "doctor_id là trường bắt buộc",
    }),
    hour_id: string({
      required_error: "hour_id là trường bắt buộc",
    }),
    date: string({
      required_error: "date là trường bắt buộc",
    }),
    reason: string({
      required_error: "reason là trường bắt buộc",
    }),
    type_patient: string({
      required_error: "type_patient là trường bắt buộc",
    }),
  }),
});

export const BookingDesktopSchema = object({
  body: object({
    patientId: string().nonempty(),
    specialtyId: number(),
    employeeId: string().nonempty(),
    doctorId: string().nonempty(),
    hourId: string().nonempty(),
    isReExamination: boolean(),
    date: string().nonempty(),
    reason: string().nonempty(),
    order: number().nonnegative(),
  }),
});

export const BookingMobileSchema = object({
  body: object({
    patientId: string().nonempty(),
    doctorId: string().nonempty(),
    hourId: string().nonempty(),
    date: string().nonempty(),
    reason: string().nonempty(),
    order: string().nonempty(),
    price: string().nonempty(),
  }),
});

export const BookingUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    patient_id: string({
      required_error: "patient_id là trường bắt buộc",
    }),
    doctor_id: string({
      required_error: "doctor_id là trường bắt buộc",
    }),
    hour_id: string({
      required_error: "hour_id là trường bắt buộc",
    }),
    date: string({
      required_error: "date là trường bắt buộc",
    }),
    reason: string({
      required_error: "reason là trường bắt buộc",
    }),
    type_patient: string({
      required_error: "type_patient là trường bắt buộc",
    }),
  }),
});

export type BookingInputCreate = TypeOf<typeof BookingCreateSchema>["body"];

export type BookingInputUpdate = TypeOf<typeof BookingUpdateSchema>;

export type BookingDesktopInput = TypeOf<typeof BookingDesktopSchema>["body"];

export type BookingMobileInput = TypeOf<typeof BookingMobileSchema>["body"];
