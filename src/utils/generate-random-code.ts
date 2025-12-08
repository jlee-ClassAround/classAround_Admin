import crypto from "crypto";

export function generateRandomCode(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charactersLength;
    result += characters.charAt(randomIndex);
  }

  return result;
}
