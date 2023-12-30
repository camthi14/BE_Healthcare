import { object, string, TypeOf } from "zod";

export const ApiKeyCreateSchema = object({
	body: object({
		key: string({
			required_error: "key là trường bắt buộc",
		}),
		ip_address: string({
			required_error: "ip_address là trường bắt buộc",
		}),
	}),
});

export const ApiKeyUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		key: string({
			required_error: "key là trường bắt buộc",
		}),
		ip_address: string({
			required_error: "ip_address là trường bắt buộc",
		}),
	}),
});

export type ApiKeyInputCreate = TypeOf<typeof ApiKeyCreateSchema>["body"];

export type ApiKeyInputUpdate = TypeOf<typeof ApiKeyUpdateSchema>;
