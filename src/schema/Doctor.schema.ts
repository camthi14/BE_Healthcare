import { PHONE_REGEX } from "@/constants/auth.contants";
import { number, object, string, TypeOf, z } from "zod";

export const DoctorCreateSchema = object({
  body: object({
    qualified_doctor_id: string({
      required_error: "Trình độ bác sĩ là trường bắt buộc",
    }),
    speciality_id: string({
      required_error: "Chuyên khoa là trường bắt buộc",
    }),
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
      .email("Email không hợp lệ.")
      .optional(),
    password: string({
      required_error: "Mật khẩu là trường bắt buộc",
    })
      .min(4, "Ít nhất 4 kí tự")
      .max(32, "Nhiều nhất 32 kí tự"),
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
    department_id: string({
      required_error: "Bộ phận là trường bắt buộc",
    }).nonempty("Bộ phận là trường không được bỏ trống!"),
    position_id: string({
      required_error: "Chức vụ là trường bắt buộc",
    }).nonempty("Chức vụ là trường không được bỏ trống!"),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
  }),
});

export const DoctorUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    qualified_doctor_id: number({
      required_error: "Id trình độ bác sĩ là trường bắt buộc",
    }),
    speciality_id: number({
      required_error: "Id chuyên khoa là trường bắt buộc",
    }),
    first_name: string({
      required_error: "Tên là trường bắt buộc",
    }).nonempty("Tên là trường không được bỏ trống!"),
    last_name: string({
      required_error: "Họ là trường bắt buộc",
    }).nonempty("Họ là trường không được bỏ trống!"),
    username: string({
      required_error: "Tài khoản là trường bắt buộc",
    }).nonempty("Tài khoản là trường không được bỏ trống!"),
    email: string({
      required_error: "Email là trường bắt buộc",
    }).email("Email không hợp lệ."),
  }),
});

export const DoctorUpdateProfileSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    qualified_doctor_id: string({
      required_error: "Trình độ bác sĩ là trường bắt buộc",
    }),
    speciality_id: string({
      required_error: "Chuyên khoa là trường bắt buộc",
    }),
    first_name: string({
      required_error: "Tên là trường bắt buộc",
    }).nonempty("Tên là trường không được bỏ trống!"),
    last_name: string({
      required_error: "Họ là trường bắt buộc",
    }).nonempty("Họ là trường không được bỏ trống!"),
    username: string({
      required_error: "Tài khoản là trường bắt buộc",
    }).nonempty("Tài khoản là trường không được bỏ trống!"),
    email: string({
      required_error: "email là trường bắt buộc",
    })
      .nonempty("Email là trường không được bỏ trống!")
      .email("Email không hợp lệ.")
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
    department_id: string({
      required_error: "Bộ phận là trường bắt buộc",
    }).nonempty("Bộ phận là trường không được bỏ trống!"),
    position_id: string({
      required_error: "Chức vụ là trường bắt buộc",
    }).nonempty("Chức vụ là trường không được bỏ trống!"),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
  }),
});

export const GetDoctorIdsSchema = object({
  body: object({
    doctorIds: string({
      required_error: "DoctorIds là trường bắt buộc",
    }).nonempty("DoctorIds là trường không được bỏ trống!"),
  }),
});

export const GetPatientsSchema = object({
  query: object({
    doctorId: string().nonempty(),
  }),
});

export type DoctorInputCreate = TypeOf<typeof DoctorCreateSchema>["body"];
export type DoctorInputUpdate = TypeOf<typeof DoctorUpdateSchema>;
export type DoctorInputUpdateProfile = TypeOf<typeof DoctorUpdateProfileSchema>;
export type GetDoctorIdsInput = TypeOf<typeof GetDoctorIdsSchema>["body"];
export type GetPatientsQuery = TypeOf<typeof GetPatientsSchema>["query"];
