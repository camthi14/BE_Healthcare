import { PHONE_REGEX } from "@/constants/auth.contants";
import { number, object, string, TypeOf, z } from "zod";

export const PatientRegisterDesktopSchema = object({
  body: object({
    patient_type_id: number({}).nonnegative(),
    phone_number: string({
      required_error: "phone_number là trường bắt buộc",
    }).regex(PHONE_REGEX, "Vui lòng nhập số điện thoại hợp lệ"),
    first_name: string({
      required_error: "Tên là trường bắt buộc",
    }).nonempty("Tên là trường không được bỏ trống!"),
    last_name: string({
      required_error: "Họ là trường bắt buộc",
    }).nonempty("Họ là trường không được bỏ trống!"),
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
    gender: z.enum(["MALE", "FEMALE"]).optional(),
  }),
});

export const PatientRegisterSchema = object({
  body: object({
    first_name: string({
      required_error: "Tên là trường bắt buộc",
    }).nonempty("Tên là trường không được bỏ trống!"),
    last_name: string({
      required_error: "Họ là trường bắt buộc",
    }).nonempty("Họ là trường không được bỏ trống!"),
    birth_date: string({
      required_error: "birth_date là trường bắt buộc",
    }).nonempty("birth_date trường không được bỏ trống!"),
    password: string({
      required_error: "password là trường bắt buộc",
    })
      .min(5, "It nhất 5 kí tự")
      .max(32, "Nhiều nhất 32 kí tự")
      .nonempty("Không được để trống"),
    phone_number: string({
      required_error: "phone_number là trường bắt buộc",
    }).regex(PHONE_REGEX, "Vui lòng nhập số điện thoại hợp lệ"),
  }),
});

export const PatientVerifyPhoneNumberSchema = object({
  body: object({
    otp: string({
      required_error: "otp là trường bắt buộc",
    })
      .nonempty("Không được để trống")
      .max(6, "Chỉ được phép nhập 6 kí tự")
      .min(6, "Chỉ được phép nhập 6 kí tự"),
  }),
  params: object({
    patientId: string({
      required_error: "patientId là trường bắt buộc",
    }).nonempty("Không được để trống"),
  }),
});

export const PatientCreateSchema = object({
  body: object({
    patient_type_id: string({
      required_error: "patient_type_id là trường bắt buộc",
    }).nonempty("Không được để trống"),
    first_name: string({
      required_error: "Tên là trường bắt buộc",
    }).nonempty("Tên là trường không được bỏ trống!"),
    last_name: string({
      required_error: "Họ là trường bắt buộc",
    }).nonempty("Họ là trường không được bỏ trống!"),
    phone_number: string({
      required_error: "phone_number là trường bắt buộc",
    }).nonempty("Không được để trống"),
    password: string({
      required_error: "password là trường bắt buộc",
    })
      .min(5, "It nhất 5 kí tự")
      .max(32, "Nhiều nhất 32 kí tự")
      .nonempty("Không được để trống"),
    email: string({
      required_error: "email là trường bắt buộc",
    })
      .email("Cung cấp địa chỉ email hợp lệ")
      .nonempty("Không được để trống"),
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

export const PatientUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    patient_type_id: string({
      required_error: "patient_type_id là trường bắt buộc",
    }),
    display_name: string({
      required_error: "display_name là trường bắt buộc",
    }),
    phone_number: string({
      required_error: "phone_number là trường bắt buộc",
    }),
    password: string({
      required_error: "password là trường bắt buộc",
    }),
    email: string({
      required_error: "email là trường bắt buộc",
    }),
  }),
});

export const PatientUpdateProfileSchema = object({
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
    email: string({
      required_error: "email là trường bắt buộc",
    }).optional(),
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

export const GetHistoryExamination = object({
  query: object({
    patientId: string().nonempty(),
  }),
});

export const PatientLoginMobileSchema = object({
  body: object({
    phone_number: string({
      required_error: "Số điện thoại là trường bắt buộc.",
    })
      .regex(PHONE_REGEX, "Số điện thoại không hợp lệ!")
      .nonempty("không được để trống số điện thoại"),
    password: string({
      required_error: "Mật khẩu là trường bắt buộc.",
    })
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự.")
      .nonempty("Không được để trống mật khẩu"),
  }),
});

export const AddRelationshipSchema = object({
  body: object({
    first_name: string().nonempty(),
    last_name: string().nonempty(),
    birth_date: string().nonempty(),
    phone_number: string().regex(PHONE_REGEX, "Vui lòng nhập số điện thoại hợp lệ"),
    relatives_id: string().nonempty(),
    relationship: z.enum(["mother", "father", "others", "married_couple", "me"]),
    gender: z.enum(["MALE", "FEMALE"]),
  }),
});

export const PatientChangePasswordSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    password: string({
      required_error: "Mật khẩu cũ là trường bắt buộc",
    })
      .nonempty("Không được để tróng")
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
    newPassword: string({
      required_error: "Mật khẩu mới là trường bắt buộc",
    })
      .nonempty("Không được để tróng")
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
  }),
});

export type PatientInputCreate = TypeOf<typeof PatientCreateSchema>["body"];

export type PatientInputRegister = TypeOf<typeof PatientRegisterSchema>["body"];

export type PatientInputUpdate = TypeOf<typeof PatientUpdateSchema>;

export type PatientInputUpdateProfile = TypeOf<typeof PatientUpdateProfileSchema>;

export type PatientRegisterDesktopInput = TypeOf<typeof PatientRegisterDesktopSchema>["body"];

export type PatientVerifyPhoneNumberInput = TypeOf<typeof PatientVerifyPhoneNumberSchema>;

export type GetHistoryExaminationQuery = TypeOf<typeof GetHistoryExamination>["query"];

export type PatientLoginMobileInput = TypeOf<typeof PatientLoginMobileSchema>["body"];

export type AddRelationshipInput = TypeOf<typeof AddRelationshipSchema>["body"];

export type PatientChangePasswordInput = TypeOf<typeof PatientChangePasswordSchema>;
