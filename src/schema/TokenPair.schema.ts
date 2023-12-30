import { object, string, TypeOf } from "zod";

export const TokenPairCreateSchema = object({
  body: object({
    public_key: string({
      required_error: "public_key là trường bắt buộc",
    }),
    private_key: string({
      required_error: "private_key là trường bắt buộc",
    }),
    refresh_token: string({
      required_error: "refresh_token là trường bắt buộc",
    }),
  }),
});

export const TokenPairUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    public_key: string({
      required_error: "public_key là trường bắt buộc",
    }),
    private_key: string({
      required_error: "private_key là trường bắt buộc",
    }),
    refresh_token: string({
      required_error: "refresh_token là trường bắt buộc",
    }),
  }),
});

export type TokenPairInputCreate = TypeOf<typeof TokenPairCreateSchema>["body"];

export type TokenPairInputUpdate = TypeOf<typeof TokenPairUpdateSchema>;
