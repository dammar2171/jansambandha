import crypto from "crypto";
import config from "../config/config";

const getSecret = () => {
  const secret =  config.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

const encode = (value) => Buffer.from(value).toString("base64url");

const decode = (value) => Buffer.from(value, "base64url").toString("utf8");

const sign = (payload, expiresInSeconds) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const claims = encode(
    JSON.stringify({ ...payload, iat: issuedAt, exp: issuedAt + expiresInSeconds })
  );
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(`${header}.${claims}`)
    .digest("base64url");
  return `${header}.${claims}.${signature}`;
};

export const generateAccessToken = (payload, expiresInSeconds = 3600) =>
  sign(payload, expiresInSeconds);

export const verifyAccessToken = (token) => {
  const [header, claims, signature] = String(token).split(".");
  if (!header || !claims || !signature) {
    throw new Error("Invalid token");
  }

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(`${header}.${claims}`)
    .digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(decode(claims));
  if (
    typeof payload.exp === "number" &&
    payload.exp < Math.floor(Date.now() / 1000)
  ) {
    throw new Error("Token expired");
  }
  return payload;
};

export default { generateAccessToken, verifyAccessToken };
