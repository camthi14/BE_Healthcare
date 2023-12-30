import { object, string, TypeOf } from "zod";

export const SessionsCheckupCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
	}),
});

export const SessionsCheckupUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
	}),
});

export type SessionsCheckupInputCreate = TypeOf<typeof SessionsCheckupCreateSchema>["body"];

export type SessionsCheckupInputUpdate = TypeOf<typeof SessionsCheckupUpdateSchema>;
