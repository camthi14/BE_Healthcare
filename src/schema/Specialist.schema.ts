import { number, object, string, TypeOf } from "zod";

export const SpecialistCreateSchema = object({
  body: object({
    name: string({
      required_error: "Tên chuyên khoa là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    time_chekup_avg: string({
      required_error: "Thoi gian kham trung binh 1 ca là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    price: string().nonempty(),
  }),
});

export const SpecialistUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "Tên chuyên khoa là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    time_chekup_avg: string({
      required_error: "Thoi gian kham trung binh 1 ca là trường bắt buộc",
    }).nonempty("Không được phép rỗng"),
    price: string().nonempty(),
  }),
});

export const GetDoctorSchema = object({
  query: object({
    date: string().nonempty(),
    specialtyId: string().optional(),
    doctorId: string().optional(),
    doctorName: string().optional(),
  }),
});

export type SpecialistInputCreate = TypeOf<typeof SpecialistCreateSchema>["body"];

export type SpecialistInputUpdate = TypeOf<typeof SpecialistUpdateSchema>;

export type GetDoctorQuery = TypeOf<typeof GetDoctorSchema>["query"];
