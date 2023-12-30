import { object, string, TypeOf } from "zod";

export const RolePermissionCreateSchema = object({
	body: object({
		permission_id: string({
			required_error: "permission_id là trường bắt buộc",
		}),
		role_id: string({
			required_error: "role_id là trường bắt buộc",
		}),
	}),
});

export const RolePermissionUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		permission_id: string({
			required_error: "permission_id là trường bắt buộc",
		}),
		role_id: string({
			required_error: "role_id là trường bắt buộc",
		}),
	}),
});

export type RolePermissionInputCreate = TypeOf<typeof RolePermissionCreateSchema>["body"];

export type RolePermissionInputUpdate = TypeOf<typeof RolePermissionUpdateSchema>;
