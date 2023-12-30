import { number, object, string, TypeOf, z } from "zod";

export const PrescriptionCreateSchema = object({
  body: object({
    exam_card_id: string().nonempty(),
    doctor_id: string().nonempty(),
    diagnosis: string().nonempty(),
    note: string().optional(),
  }),
});

export const PrescriptionUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    exam_card_id: string().nonempty(),
    doctor_id: string().nonempty(),
    diagnosis: string().nonempty(),
    note: string().optional(),
    date_re_exam: string().optional(),
    quantity_re_exam: number().optional(),
  }),
});

const medicinesSchema = object({
  id: string().optional(),
  medicine_id: string().nonempty(),
  quantity_ordered: number().nonnegative(),
  note: string(),

  amount_use_in_day: z.enum(["1", "2", "3"]),
  amount_of_medication_per_session: number().nonnegative(),
  session: string().optional(),
});

export const AddPrescriptionDetailsSchema = object({
  body: object({
    id: string().optional(),
    exam_card_id: string().nonempty(),
    prescriptions_id: string().nonempty(),
    totalCost: number().nonnegative(),
    quantityReExam: number().nonnegative(),
    medicines: medicinesSchema.array().nonempty(),
  }),
});

export const GetByExamCardIdSchema = object({
  query: object({
    examCardId: string({}).nonempty(),
    doctorId: string({}).nonempty(),
  }),
});

export const GetByExamCardIdSchemaV2 = object({
  query: object({
    examCardId: string({}).nonempty(),
  }),
});

export const ReceivePrescriptionSchema = object({
  body: object({
    examCardId: string({}).nonempty(),
    employeeId: string().nonempty(),
  }),
});

export type PrescriptionInputCreate = TypeOf<typeof PrescriptionCreateSchema>["body"];

export type PrescriptionInputUpdate = TypeOf<typeof PrescriptionUpdateSchema>;

export type GetByExamCardIdQuery = TypeOf<typeof GetByExamCardIdSchema>["query"];

export type GetByExamCardIdQueryV2 = TypeOf<typeof GetByExamCardIdSchemaV2>["query"];

export type AddPrescriptionDetailsInput = TypeOf<typeof AddPrescriptionDetailsSchema>["body"];

export type ReceivePrescriptionInput = TypeOf<typeof ReceivePrescriptionSchema>["body"];
