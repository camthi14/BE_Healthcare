import { object, string, TypeOf } from "zod";

export const RefreshTokensUseCreateSchema = object({
	body: object({
		key_id: string({
			required_error: "key_id là trường bắt buộc",
		}),
		refresh_token: string({
			required_error: "refresh_token là trường bắt buộc",
		}),
	}),
});

export const RefreshTokensUseUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		key_id: string({
			required_error: "key_id là trường bắt buộc",
		}),
		refresh_token: string({
			required_error: "refresh_token là trường bắt buộc",
		}),
	}),
});

export type RefreshTokensUseInputCreate = TypeOf<typeof RefreshTokensUseCreateSchema>["body"];

export type RefreshTokensUseInputUpdate = TypeOf<typeof RefreshTokensUseUpdateSchema>;
