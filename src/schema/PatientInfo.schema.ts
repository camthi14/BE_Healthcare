import { object, string, TypeOf } from "zod";

export const PatientInfoCreateSchema = object({
	body: object({
		patient_id: string({
			required_error: "patient_id là trường bắt buộc",
		}),
		first_name: string({
			required_error: "first_name là trường bắt buộc",
		}),
		last_name: string({
			required_error: "last_name là trường bắt buộc",
		}),
	}),
});

export const PatientInfoUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		patient_id: string({
			required_error: "patient_id là trường bắt buộc",
		}),
		first_name: string({
			required_error: "first_name là trường bắt buộc",
		}),
		last_name: string({
			required_error: "last_name là trường bắt buộc",
		}),
	}),
});

export type PatientInfoInputCreate = TypeOf<typeof PatientInfoCreateSchema>["body"];

export type PatientInfoInputUpdate = TypeOf<typeof PatientInfoUpdateSchema>;
