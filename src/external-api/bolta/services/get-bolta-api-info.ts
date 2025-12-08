export const getEncryptedBoltaApiKey = () => {
  const encryptedBoltaApiKey =
    "Basic " + Buffer.from(process.env.BOLTA_API_KEY! + ":").toString("base64");

  return encryptedBoltaApiKey;
};

export const getBoltaCustomerKey = () => {
  const boltaCustomerKey = process.env.BOLTA_CUSTOMER_KEY!;

  return boltaCustomerKey;
};
