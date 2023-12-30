import { object, string, TypeOf } from "zod";

export const BillCreateSchema = object({
  body: object({
    employee_id: string({
      required_error: "employee_id là trường bắt buộc",
    }),
    booking_id: string({
      required_error: "booking_id là trường bắt buộc",
    }),
    examination_card_id: string({
      required_error: "examination_card_id là trường bắt buộc",
    }),
    total_price: string({
      required_error: "total_price là trường bắt buộc",
    }),
    payment_for: string({
      required_error: "payment_for là trường bắt buộc",
    }),
    status: string({
      required_error: "status là trường bắt buộc",
    }),
  }),
});

export const BillUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    employee_id: string().optional(),
    booking_id: string().optional(),
    examination_card_id: string().optional(),
    total_price: string().optional(),
    payment_for: string().optional(),
    status: string().optional(),
  }),
});

export type BillInputCreate = TypeOf<typeof BillCreateSchema>["body"];

export type BillInputUpdate = TypeOf<typeof BillUpdateSchema>;
