import dayjs from "dayjs";
import otpGenerate from "otp-generator";


/**
 * @description Generate OTP with character default `length = 6`
 * @param length
 * @returns
 */
export const generateOTP = (length = 6) =>
  otpGenerate.generate(length, {
    digits: true,
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });

/**
 * @description Generate uuid + prefix with generateOTP number
 * @param prefix
 * @returns
 * @example
 * PID230408112103
 */
export const generateUUID = (prefix: string) =>
  `${prefix}${dayjs().format("YYMMDD")}${generateOTP()}`;

