import { object, string, TypeOf } from "zod";

export const OwnerInfoCreateSchema = object({
	body: object({
		owner_id: string({
			required_error: "owner_id là trường bắt buộc",
		}),
		first_name: string({
			required_error: "first_name là trường bắt buộc",
		}),
		last_name: string({
			required_error: "last_name là trường bắt buộc",
		}),
	}),
});

export const OwnerInfoUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		owner_id: string({
			required_error: "owner_id là trường bắt buộc",
		}),
		first_name: string({
			required_error: "first_name là trường bắt buộc",
		}),
		last_name: string({
			required_error: "last_name là trường bắt buộc",
		}),
	}),
});

export type OwnerInfoInputCreate = TypeOf<typeof OwnerInfoCreateSchema>["body"];

export type OwnerInfoInputUpdate = TypeOf<typeof OwnerInfoUpdateSchema>;
