import { object, string, TypeOf } from "zod";

export const AuthLoginSchema = object({
  body: object({
    username: string({
      required_error: "Tài khoản là trường bắt buộc",
    }).nonempty("Tài khoản là trường không được bỏ trống!"),
    password: string({
      required_error: "Mật khẩu là trường bắt buộc",
    })
      .min(4, "Ít nhất 4 kí tự")
      .max(32, "Nhiều nhất 32 kí tự"),
  }),
});

export const AuthChangePassWordSchema = object({
  body: object({
    password: string({
      required_error: "Mật khẩu cũ là trường bắt buộc",
    })
      .nonempty("Mật khẩu cũ không được để trống")
      .min(4, "Mật khẩu ít nhất 4 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
    newPassword: string({
      required_error: "Mật khẩu mới là trường bắt buộc",
    })
      .nonempty("Mật khẩu mới không được để trống")
      .min(4, "Mật khẩu ít nhất 4 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
  }),
});

export const AuthForgotPassWordSchema = object({
  body: object({
    email: string({
      required_error: "Email là trường bắt buộc",
    })
      .nonempty("Địa chỉ email không được để trống")
      .email("Địa chỉ email không hợp lệ"),
    username: string({
      required_error: "Tài khoản là trường bắt buộc",
    }).nonempty("Không được để trống tài khoản"),
  }),
});

export const AuthResetPassWordSchema = object({
  params: object({
    id: string({
      required_error: "User Id là trường bắt buộc",
    }).nonempty("Không được để trống User Id"),
    token: string({
      required_error: "Token là trường bắt buộc",
    }).nonempty("Không được để trống Token"),
  }),
  body: object({
    password: string({
      required_error: "Mật khẩu là trường bắt buộc",
    })
      .nonempty("Không được để trống")
      .min(4, "Mật khẩu ít nhất 4 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
  }),
});

export type AuthInputLogin = TypeOf<typeof AuthLoginSchema>["body"];
export type AuthChangePasswordInput = TypeOf<typeof AuthChangePassWordSchema>["body"];
export type AuthForgotPasswordInput = TypeOf<typeof AuthForgotPassWordSchema>["body"];
export type AuthResetPasswordParams = TypeOf<typeof AuthResetPassWordSchema>;
