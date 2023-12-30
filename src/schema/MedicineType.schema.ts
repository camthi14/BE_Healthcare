import { object, string, TypeOf } from "zod";

export const MedicineTypeCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		desc: string({
			required_error: "desc là trường bắt buộc",
		}),
	}),
});

export const MedicineTypeUpdateSchema = object({
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

export type MedicineTypeInputCreate = TypeOf<typeof MedicineTypeCreateSchema>["body"];

export type MedicineTypeInputUpdate = TypeOf<typeof MedicineTypeUpdateSchema>;
