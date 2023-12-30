import { object, string, TypeOf } from "zod";

export const QualifiedDoctorCreateSchema = object({
  body: object({
    name: string({
      required_error: "Tên trình độ trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    character: string({
      required_error: "Kí tự viết tắt trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
  }),
});

export const QualifiedDoctorUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "Tên trình độ trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    character: string({
      required_error: "Kí tự viết tắt trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
  }),
});

export type QualifiedDoctorInputCreate = TypeOf<typeof QualifiedDoctorCreateSchema>["body"];

export type QualifiedDoctorInputUpdate = TypeOf<typeof QualifiedDoctorUpdateSchema>;
