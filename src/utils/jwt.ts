import { JWTPayload } from "jose/jwt/sign";
import { JWK, parseJwk } from "jose/jwk/parse";
import { jwtVerify } from "jose/jwt/verify";

async function getJWTSigningKey() {
  return await parseJwk(JSON.parse(process.env.ACCESS_TOKEN_SIGNING_KEY!));
}

export async function isJwtTokenValid(
  token: string,
): Promise<[boolean, JWTPayload | null]> {
  try {
    const { payload } = await jwtVerify(token, await getJWTSigningKey());
    return [true, payload];
  } catch (error) {
    return [false, null];
  }
}
