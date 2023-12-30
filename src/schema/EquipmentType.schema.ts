import { object, string, TypeOf } from "zod";

export const EquipmentTypeCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		desc: string({
			required_error: "desc là trường bắt buộc",
		}),
	}),
});

export const EquipmentTypeUpdateSchema = object({
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

export type EquipmentTypeInputCreate = TypeOf<typeof EquipmentTypeCreateSchema>["body"];

export type EquipmentTypeInputUpdate = TypeOf<typeof EquipmentTypeUpdateSchema>;
