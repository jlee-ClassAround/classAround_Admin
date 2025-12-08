export async function sendZapierWebhookToSolapi(
  username: string,
  phone: string,
  webhookUrl: string
) {
  await fetch(webhookUrl, {
    method: "POST",
    body: JSON.stringify({ username, phone }),
  });
}
