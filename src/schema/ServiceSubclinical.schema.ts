import { object, string, TypeOf } from "zod";

export const ServiceSubclinicalCreateSchema = object({
	body: object({
		service_id: string({
			required_error: "service_id là trường bắt buộc",
		}),
		subclinical_id: string({
			required_error: "subclinical_id là trường bắt buộc",
		}),
	}),
});

export const ServiceSubclinicalUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		service_id: string({
			required_error: "service_id là trường bắt buộc",
		}),
		subclinical_id: string({
			required_error: "subclinical_id là trường bắt buộc",
		}),
	}),
});

export type ServiceSubclinicalInputCreate = TypeOf<typeof ServiceSubclinicalCreateSchema>["body"];

export type ServiceSubclinicalInputUpdate = TypeOf<typeof ServiceSubclinicalUpdateSchema>;
