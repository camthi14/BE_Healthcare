import { object, string, TypeOf } from "zod";

export const SubclinicalTypeCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
	}),
});

export const SubclinicalTypeUpdateSchema = object({
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

export type SubclinicalTypeInputCreate = TypeOf<typeof SubclinicalTypeCreateSchema>["body"];

export type SubclinicalTypeInputUpdate = TypeOf<typeof SubclinicalTypeUpdateSchema>;
