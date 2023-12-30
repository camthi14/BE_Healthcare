import { object, string, TypeOf } from "zod";

export const EquipmentCreateSchema = object({
  body: object({
    equipment_type_id: string({
      required_error: "Loại thiết bị là trường bắt buộc",
    }),
    name: string({
      required_error: "Tên thiết bị là trường bắt buộc",
    }),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }),
  }),
});

export const EquipmentUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    equipment_type_id: string({
      required_error: "Loại thiết bị là trường bắt buộc",
    }),
    name: string({
      required_error: "Tên thiết bị là trường bắt buộc",
    }),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }),
  }),
});

export type EquipmentInputCreate = TypeOf<typeof EquipmentCreateSchema>["body"];

export type EquipmentInputUpdate = TypeOf<typeof EquipmentUpdateSchema>;
