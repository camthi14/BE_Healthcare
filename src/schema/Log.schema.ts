import { object, string, TypeOf } from "zod";

export const LogCreateSchema = object({
	body: object({
		filename: string({
			required_error: "filename là trường bắt buộc",
		}),
		log_type: string({
			required_error: "log_type là trường bắt buộc",
		}),
	}),
});

export const LogUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		filename: string({
			required_error: "filename là trường bắt buộc",
		}),
		log_type: string({
			required_error: "log_type là trường bắt buộc",
		}),
	}),
});

export type LogInputCreate = TypeOf<typeof LogCreateSchema>["body"];

export type LogInputUpdate = TypeOf<typeof LogUpdateSchema>;
