import JWT from "jsonwebtoken";
import crypto from "node:crypto";
import { GenerateJWT, GenerateTokenPairProps } from "types";
import bcrypt from "bcrypt";
import { env } from "config";
import otpGenerate from "otp-generator";

/**
 * @description Generate JWT with payload extends object
 * @param param0
 * @returns
 */
export const generateJWT = <T extends object>({ payload, secureKey, expiresIn }: GenerateJWT<T>) =>
  JWT.sign(payload, secureKey, { expiresIn });

/**
 * @description Generate api key with crypto ramdomBytes 64 to hex
 * @returns
 */
export const generateApiKey = () => crypto.randomBytes(64).toString("hex");

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const result = await bcrypt.hash(password, salt);
  return result;
};

export const createTokenPair = <T extends object>({
  payload,
  expiresInPrivateKey,
  expiresInPublicKey,
  privateKey,
  publicKey,
}: GenerateTokenPairProps<T>) => {
  expiresInPrivateKey = env.EXPIRES_IN_PRIVATE_KEY;
  expiresInPublicKey = env.EXPIRES_IN_PUBLIC_KEY;

  const accessToken = JWT.sign(payload, publicKey, { expiresIn: expiresInPublicKey });
  const refreshToken = JWT.sign(payload, privateKey, { expiresIn: expiresInPrivateKey });
  return { accessToken, refreshToken };
};

export const generateOtp = (length?: number, isText = false) => {
  return otpGenerate.generate(length ?? 6, {
    digits: isText ? false : true,
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: isText,
  });
};

export const generateTokenOTP = (secureKey: string, expiresIn: string | undefined, length = 16) => {
  const TOKEN = generateOtp(length);
  const hashToken = generateJWT({
    payload: { token: TOKEN },
    secureKey: secureKey,
    expiresIn: expiresIn ?? "15m",
  });
  return { TOKEN, hashToken };
};
