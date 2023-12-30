import { number, object, string, TypeOf } from "zod";

export const SubclinicalCreateSchema = object({
  body: object({
    subclinical_type_id: number(),
    name: string().nonempty(),
    content: string().nonempty(),
    desc: string().nonempty(),
    price: number(),
    room_id: number(),
  }),
});

export const SubclinicalUpdateSchema = object({
  params: object({
    id: string(),
  }),
  body: object({
    subclinical_type_id: number(),
    name: string().nonempty(),
    content: string().nonempty(),
    desc: string().nonempty(),
    price: number(),
    room_id: number(),
  }),
});

export type SubclinicalInputCreate = TypeOf<typeof SubclinicalCreateSchema>["body"];

export type SubclinicalInputUpdate = TypeOf<typeof SubclinicalUpdateSchema>;
