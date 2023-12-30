import { number, object, string, TypeOf } from "zod";

export const ResultsDiagnosisSubclinicalCreateSchema = object({
  body: object({
    exam_card_details_id: string().nonempty(),
    subclinical_id: string().nonempty(),
    rate: string().nonempty(),
    results: string().nonempty(),
    removeImages: string().optional(),
  }),
});

export const GetByCardDetailIdSchema = object({
  query: object({
    exam_card_details_id: string().nonempty(),
    subclinical_id: number().nonnegative(),
  }),
});

export const ResultsDiagnosisSubclinicalUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    exam_card_details_id: string().nonempty(),
    subclinical_id: string().nonempty(),
    rate: string().nonempty(),
    results: string().nonempty(),
  }),
});

export type ResultsDiagnosisSubclinicalInputCreate = TypeOf<
  typeof ResultsDiagnosisSubclinicalCreateSchema
>["body"];

export type ResultsDiagnosisSubclinicalInputUpdate = TypeOf<
  typeof ResultsDiagnosisSubclinicalUpdateSchema
>;

export type GetByCardDetailIdQuery = TypeOf<typeof GetByCardDetailIdSchema>["query"];
