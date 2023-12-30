import { ApiKeyService, TokenPairService } from "@/services";
import { createTokenPair, generateApiKey } from "@/utils";
import { ObjectType } from "types";
import { TokenPair } from "./TokenPair.model";

class AuthModel {
  protected static generateKeyPairSync = async (
    id: number | string,
    conditions: ObjectType<TokenPair>
  ) => {
    /** `refreshToken` */
    const privateKeySecure = generateApiKey();

    /** `accessToken` */
    const publicKeySecure = generateApiKey();

    const tokens = createTokenPair({
      payload: { id },
      privateKey: privateKeySecure,
      publicKey: publicKeySecure,
    });

    const [findTokenPair, apiKey] = await Promise.all([
      TokenPairService.findOne(conditions),
      ApiKeyService.findOne(conditions),
    ]);

    if (findTokenPair) {
      await TokenPairService.update(
        {
          private_key: privateKeySecure,
          public_key: publicKeySecure,
          refresh_token: tokens.refreshToken,
          ...conditions,
        },
        findTokenPair.id!
      );
    } else {
      await TokenPairService.create({
        private_key: privateKeySecure,
        public_key: publicKeySecure,
        refresh_token: tokens.refreshToken,
        ...conditions,
      });
    }

    return { ...tokens, apiKey: apiKey ? apiKey : null };
  };
}

export default AuthModel;
