import {
  EmployeeInfoService,
  EmployeeService,
  PatientInfoService,
  PatientService,
} from "@/services";

export const ServicesAuth = {
  Index: {
    patient: () => PatientService,
    employee: () => EmployeeService,
  },
  Profile: {
    patient: () => PatientInfoService,
    employee: () => EmployeeInfoService,
  },
};

export const PHONE_REGEX = /((0[1|2|3|4|5|6|7|8|9])+([0-9]{8})\b)/g;
