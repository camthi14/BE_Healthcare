import { object, string, TypeOf } from "zod";

export const ServiceTypeCreateSchema = object({
	body: object({
		name: string({
			required_error: "Tên loại dịch vụ là trường bắt buộc",
		}),
		desc: string({
			required_error: "Mô tả là trường bắt buộc",
		}),
	}),
});

export const ServiceTypeUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "Tên loại dịch vụ là trường bắt buộc",
    }),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    }),
  }),
});

export type ServiceTypeInputCreate = TypeOf<typeof ServiceTypeCreateSchema>["body"];

export type ServiceTypeInputUpdate = TypeOf<typeof ServiceTypeUpdateSchema>;
