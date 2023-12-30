import { object, string, TypeOf } from "zod";

export const UnitCreateSchema = object({
  body: object({
    name: string({
      required_error: "Tên đơn vị tính là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }).optional(),
    character: string({
      required_error: "character là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
  }),
});

export const UnitUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "Tên đơn vị tính là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }).optional(),
    character: string({
      required_error: "character là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
  }),
});

export type UnitInputCreate = TypeOf<typeof UnitCreateSchema>["body"];

export type UnitInputUpdate = TypeOf<typeof UnitUpdateSchema>;
