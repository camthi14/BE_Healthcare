import { object, string, TypeOf } from "zod";

export const RoomCreateSchema = object({
  body: object({
    name: string(),
    desc: string(),
    equipment_id: string(),
  }),
});

export const RoomUpdateSchema = object({
  params: object({
    id: string(),
  }),
  body: object({
    name: string(),
    desc: string(),
    equipment_id: string(),
  }),
});

export type RoomInputCreate = TypeOf<typeof RoomCreateSchema>["body"];

export type RoomInputUpdate = TypeOf<typeof RoomUpdateSchema>;
