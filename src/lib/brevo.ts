import * as SibApiV3Sdk from "@getbrevo/brevo";

const apiInstance = new SibApiV3Sdk.ContactsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.ContactsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export const contactsApi = apiInstance;
