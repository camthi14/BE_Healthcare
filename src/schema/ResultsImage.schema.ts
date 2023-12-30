import { object, string, TypeOf } from "zod";

export const ResultsImageCreateSchema = object({
	body: object({
		result_id: string({
			required_error: "result_id là trường bắt buộc",
		}),
		url: string({
			required_error: "url là trường bắt buộc",
		}),
	}),
});

export const ResultsImageUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		result_id: string({
			required_error: "result_id là trường bắt buộc",
		}),
		url: string({
			required_error: "url là trường bắt buộc",
		}),
	}),
});

export type ResultsImageInputCreate = TypeOf<typeof ResultsImageCreateSchema>["body"];

export type ResultsImageInputUpdate = TypeOf<typeof ResultsImageUpdateSchema>;
