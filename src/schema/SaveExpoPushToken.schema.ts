import { object, string, TypeOf } from "zod";

export const SaveExpoPushTokenCreateSchema = object({
	body: object({
	}),
});

export const SaveExpoPushTokenUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
	}),
});

export type SaveExpoPushTokenInputCreate = TypeOf<typeof SaveExpoPushTokenCreateSchema>["body"];

export type SaveExpoPushTokenInputUpdate = TypeOf<typeof SaveExpoPushTokenUpdateSchema>;
