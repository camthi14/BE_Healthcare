import { object, string, TypeOf } from "zod";

export const ServiceCreateSchema = object({
  body: object({
    service_type_id: string(),
    name: string().nonempty(),
    content: string().nonempty(),
    desc: string().nonempty(),
    price: string(),
    subclinical: string(),
  }),
});

export const ServiceUpdateSchema = object({
  params: object({
    id: string(),
  }),
  body: object({
    service_type_id: string().optional(),
    name: string().optional(),
    content: string().optional(),
    desc: string().optional(),
    price: string().optional(),
    subclinical: string(),
  }),
});

export type ServiceInputCreate = TypeOf<typeof ServiceCreateSchema>["body"];

export type ServiceInputUpdate = TypeOf<typeof ServiceUpdateSchema>;
