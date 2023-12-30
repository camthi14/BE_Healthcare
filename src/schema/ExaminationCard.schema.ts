import { boolean, number, object, string, TypeOf, z } from "zod";

export const ExaminationCardCreateSchema = object({
  body: object({
    order: number(),
    booking_id: string(),
    employee_id: string(),
    artery: number().nonnegative(),
    blood_pressure: number().nonnegative(),
    breathing_rate: number().nonnegative(),
    is_use_service: boolean(),
    spO2: number().nonnegative(),
    temperature: number().nonnegative(),
    under_blood_pressure: number().nonnegative(),
  }),
});

const dataSchema = object({
  id: number().nonnegative(),
  price: number().nonnegative(),
});

export const ServiceExaminationCreateSchema = object({
  body: object({
    examination_card_id: string().nonempty(),
    employee_id: string().nonempty(),
    bill_id: string().nonempty(),
    booking_id: string().nonempty(),
    options: z.enum(["service", "subclinical", "doctor.service", "doctor.subclinical"]),
    service_id: number().nonnegative(),
    data: dataSchema.array(),
  }),
});

export const ExaminationCardUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    order: string({
      required_error: "order là trường bắt buộc",
    }),
    booking_id: string({
      required_error: "booking_id là trường bắt buộc",
    }),
    note: string({
      required_error: "note là trường bắt buộc",
    }),
  }),
});

export const GetPatientForDateSchema = object({
  query: object({
    date: string().nonempty(),
    bookingStatus: z.enum([
      "in_progress",
      "waiting",
      "completed",
      "paid",
      "canceled",
      "doctor_canceled",
      "waiting",
      "examinate",
    ]),
    examinationStatus: z
      .enum(["in_progress", "complete", "pending", "reject", "delay_results", "examination"])
      .optional(),
    doctorId: string().optional(),
  }),
});

export const GetRequiredSchema = object({
  query: object({
    examinationCardId: string().nonempty(),
    doctorId: string().nonempty(),
    status: z.enum(["required", "finished", "unfinished"]),
  }),
});

export const PaymentServiceSchema = object({
  body: object({
    bill_id: string().nonempty(),
    booking_id: string().nonempty(),
    deposit: number().nonnegative(),
    change: number(),
    price_received: number().nonnegative(),
    total: number().nonnegative(),
  }),
});

export const ConfirmExaminationSchema = object({
  body: object({
    examinationId: string().nonempty(),
    doctorId: string().nonempty(),
  }),
});

export const GetExaminationCardDetailsSchema = object({
  query: object({
    examinationCardId: string().nonempty(),
  }),
});

const SubclinicalSchema = object({ id: number().nonnegative(), price: number().nonnegative() });

export const RequiredExaminationSchema = object({
  body: object({
    examinationCardId: string().nonempty(),
    doctorId: string().nonempty(),
    data: SubclinicalSchema.array(),
  }),
});

export type ExaminationCardInputCreate = TypeOf<typeof ExaminationCardCreateSchema>["body"];
export type ServiceExaminationCreateInput = TypeOf<typeof ServiceExaminationCreateSchema>["body"];
export type PaymentInput = TypeOf<typeof PaymentServiceSchema>["body"];
export type ExaminationCardInputUpdate = TypeOf<typeof ExaminationCardUpdateSchema>;
export type GetPatientForDateQuery = TypeOf<typeof GetPatientForDateSchema>["query"];
export type GetRequiredQuery = TypeOf<typeof GetRequiredSchema>["query"];
export type GetExaminationCardDetailsQuery = TypeOf<
  typeof GetExaminationCardDetailsSchema
>["query"];
export type ConfirmExaminationInput = TypeOf<typeof ConfirmExaminationSchema>["body"];
export type RequiredExaminationInput = TypeOf<typeof RequiredExaminationSchema>["body"];
