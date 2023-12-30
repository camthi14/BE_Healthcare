import { number, object, string, TypeOf, z } from "zod";

export const PrescriptionsDetailCreateSchema = object({
  body: object({
    prescriptions_id: string().nonempty(),
    medicine_id: string().nonempty(),
    quantity_ordered: number().nonnegative(),
    note: string().nonempty(),

    amount_use_in_day: z.enum(["1", "2", "3"]),
    amount_of_medication_per_session: number().nonnegative(),
    session: string().optional(),
  }),
});

export const PrescriptionsDetailUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    prescriptions_id: string({
      required_error: "prescriptions_id là trường bắt buộc",
    }),
  }),
});

export type PrescriptionsDetailInputCreate = TypeOf<typeof PrescriptionsDetailCreateSchema>["body"];

export type PrescriptionsDetailInputUpdate = TypeOf<typeof PrescriptionsDetailUpdateSchema>;
