import { object, string, TypeOf } from "zod";

export const DoctorsInforCreateSchema = object({
  body: object({
    doctor_id: string({
      required_error: "doctor_id là trường bắt buộc",
    }),
    first_name: string({
      required_error: "first_name là trường bắt buộc",
    }),
    last_name: string({
      required_error: "last_name là trường bắt buộc",
    }),
  }),
});

export const DoctorsInforUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    doctor_id: string({
      required_error: "doctor_id là trường bắt buộc",
    }),
    first_name: string({
      required_error: "first_name là trường bắt buộc",
    }),
    last_name: string({
      required_error: "last_name là trường bắt buộc",
    }),
  }),
});

export type DoctorsInforInputCreate = TypeOf<typeof DoctorsInforCreateSchema>["body"];

export type DoctorsInforInputUpdate = TypeOf<typeof DoctorsInforUpdateSchema>;
