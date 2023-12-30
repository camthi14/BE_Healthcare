import { object, string, TypeOf } from "zod";

export const RoleCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		desc: string({
			required_error: "desc là trường bắt buộc",
		}),
	}),
});

export const RoleUpdateSchema = object({
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

export type RoleInputCreate = TypeOf<typeof RoleCreateSchema>["body"];

export type RoleInputUpdate = TypeOf<typeof RoleUpdateSchema>;
