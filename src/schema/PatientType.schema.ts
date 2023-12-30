import { object, string, TypeOf } from "zod";

export const PatientTypeCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		desc: string({
			required_error: "desc là trường bắt buộc",
		}),
	}),
});

export const PatientTypeUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		desc: string({
			required_error: "desc là trường bắt buộc",
		}),
	}),
});

export type PatientTypeInputCreate = TypeOf<typeof PatientTypeCreateSchema>["body"];

export type PatientTypeInputUpdate = TypeOf<typeof PatientTypeUpdateSchema>;
