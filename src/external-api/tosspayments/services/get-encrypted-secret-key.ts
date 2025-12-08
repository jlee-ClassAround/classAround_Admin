export const getEncryptedSecretKey = () => {
  const encryptedSecretKey =
    "Basic " +
    Buffer.from(process.env.TOSS_SECRET_KEY! + ":").toString("base64");

  return encryptedSecretKey;
};
