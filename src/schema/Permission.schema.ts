import { object, string, TypeOf } from "zod";

export const PermissionCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		alias: string({
			required_error: "alias là trường bắt buộc",
		}),
		desc: string({
			required_error: "desc là trường bắt buộc",
		}),
	}),
});

export const PermissionUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		alias: string({
			required_error: "alias là trường bắt buộc",
		}),
		desc: string({
			required_error: "desc là trường bắt buộc",
		}),
	}),
});

export type PermissionInputCreate = TypeOf<typeof PermissionCreateSchema>["body"];

export type PermissionInputUpdate = TypeOf<typeof PermissionUpdateSchema>;
