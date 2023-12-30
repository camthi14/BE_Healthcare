export type GenerateJWT<Payload extends object> = {
  payload: Payload;
  secureKey: string;
  expiresIn?: string | number;
};

export type GenerateTokenPairProps<Payload extends object> = {
  payload: Payload;
  /** @description for accessToken */
  publicKey: string;
  /** @description for refreshToken */
  privateKey: string;
  /** @description expiresIn for accessToken */
  expiresInPublicKey?: string | number;
  /** @description expiresIn for refreshToken */
  expiresInPrivateKey?: string | number;
};
