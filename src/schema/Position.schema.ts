import { object, string, TypeOf } from "zod";

export const PositionCreateSchema = object({
  body: object({
    name: string({
      required_error: "Tên chức vụ là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
  }),
});

export const PositionUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "Tên chức vụ là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
  }),
});

export type PositionInputCreate = TypeOf<typeof PositionCreateSchema>["body"];

export type PositionInputUpdate = TypeOf<typeof PositionUpdateSchema>;
