import { object, string, TypeOf } from "zod";

export const DepartmentCreateSchema = object({
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
  }),
});

export const DepartmentUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
  }),
});

export type DepartmentInputCreate = TypeOf<typeof DepartmentCreateSchema>["body"];

export type DepartmentInputUpdate = TypeOf<typeof DepartmentUpdateSchema>;
