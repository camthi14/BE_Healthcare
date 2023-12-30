import { number, object, string, TypeOf } from "zod";

export const MedicineCreateSchema = object({
  body: object({
    medictine_type_id: number().nonnegative(),
    unit_id: number().nonnegative(),
    name: string().nonempty(),
    quantity: number().nonnegative(),
    price: number().nonnegative(),
    production_date: string().nonempty(),
    drug_concentration: number().nonnegative(),
    price_sell: number().nonnegative(),
    ingredients: string().nonempty(),
    expired_at: string().nonempty(),
  }),
});

export const MedicineUpdateSchema = object({
  params: object({
    id: string(),
  }),
  body: object({
    medictine_type_id: number().nonnegative().optional(),
    unit_id: number().nonnegative().optional(),
    name: string().nonempty().optional(),
    quantity: number().nonnegative().optional(),
    price: number().nonnegative().optional(),
    production_date: string().nonempty().optional(),
    drug_concentration: number().nonnegative().optional(),
    price_sell: number().nonnegative().optional(),
    ingredients: string().nonempty().optional(),
    expired_at: string().nonempty().optional(),
  }),
});

export type MedicineInputCreate = TypeOf<typeof MedicineCreateSchema>["body"];

export type MedicineInputUpdate = TypeOf<typeof MedicineUpdateSchema>;
