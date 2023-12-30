import { object, string, TypeOf } from "zod";

export const ExaminationCardsDetailCreateSchema = object({
	body: object({
		examination_card_id: string({
			required_error: "examination_card_id là trường bắt buộc",
		}),
		service_entity: string({
			required_error: "service_entity là trường bắt buộc",
		}),
		service_value: string({
			required_error: "service_value là trường bắt buộc",
		}),
	}),
});

export const ExaminationCardsDetailUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		examination_card_id: string({
			required_error: "examination_card_id là trường bắt buộc",
		}),
		service_entity: string({
			required_error: "service_entity là trường bắt buộc",
		}),
		service_value: string({
			required_error: "service_value là trường bắt buộc",
		}),
	}),
});

export type ExaminationCardsDetailInputCreate = TypeOf<typeof ExaminationCardsDetailCreateSchema>["body"];

export type ExaminationCardsDetailInputUpdate = TypeOf<typeof ExaminationCardsDetailUpdateSchema>;
