import { PHONE_REGEX } from "@/constants/auth.contants";
import { object, string, TypeOf, z } from "zod";

export const OwnerCreateSchema = object({
  body: object({
    first_name: string({
      required_error: "Tên là trường bắt buộc",
    }).nonempty("Tên là trường không được bỏ trống!"),
    last_name: string({
      required_error: "Họ là trường bắt buộc",
    }).nonempty("Họ là trường không được bỏ trống!"),
    username: string({
      required_error: "Tài khoản là trường bắt buộc",
    }).nonempty("Tài khoản là trường không được bỏ trống!"),
    password: string({
      required_error: "Mật khẩu là trường bắt buộc",
    })
      .min(4, "Ít nhất 4 kí tự")
      .max(32, "Nhiều nhất 32 kí tự"),
    email: string({
      required_error: "Email là trường bắt buộc",
    }).email("Email không hợp lệ."),
  }),
});

export const OwnerUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    first_name: string({
      required_error: "Tên là trường bắt buộc",
    }).nonempty("Tên là trường không được bỏ trống!"),
    last_name: string({
      required_error: "Họ là trường bắt buộc",
    }).nonempty("Họ là trường không được bỏ trống!"),
    username: string({
      required_error: "username là trường bắt buộc",
    }).nonempty("Tài khoản là trường không được bỏ trống!"),
    email: string({
      required_error: "email là trường bắt buộc",
    })
      .nonempty("Email là trường không được bỏ trống!")
      .email(),
  }),
});

export const OwnerUpdateProfileSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    first_name: string({
      required_error: "Tên là trường bắt buộc",
    }).nonempty("Tên là trường không được bỏ trống!"),
    last_name: string({
      required_error: "Họ là trường bắt buộc",
    }).nonempty("Họ là trường không được bỏ trống!"),
    username: string({
      required_error: "username là trường bắt buộc",
    }).nonempty("Tài khoản là trường không được bỏ trống!"),
    email: string({
      required_error: "email là trường bắt buộc",
    })
      .nonempty("Email là trường không được bỏ trống!")
      .email()
      .optional(),
    phone_number: string({
      required_error: "Số điện thoại là trường bắt buộc",
    })
      .regex(PHONE_REGEX, "Vui lòng nhập số điện thoại hợp lệ")
      .nonempty("Tài khoản là trường không được bỏ trống!"),
    birth_date: string({
      required_error: "Ngày sinh là trường bắt buộc",
    })
      .nonempty("Ngày sinh là trường không được bỏ trống!")
      .optional(),
    address: string({
      required_error: "Địa chỉ là trường bắt buộc",
    })
      .nonempty("Địa chỉ là trường không được bỏ trống!")
      .optional(),
    desc: string({
      required_error: "Mô tả là trường bắt buộc",
    })
      .nonempty("Mô tả là trường không được bỏ trống!")
      .optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
  }),
});

export type OwnerInputCreate = TypeOf<typeof OwnerCreateSchema>["body"];
export type OwnerInputUpdate = TypeOf<typeof OwnerUpdateSchema>;
export type OwnerInputUpdateProfile = TypeOf<typeof OwnerUpdateProfileSchema>;
