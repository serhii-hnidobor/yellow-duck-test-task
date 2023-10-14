function getTrelloWebhookCallbackUrl(apiUrl: string) {
  return `${apiUrl}/bot/webhook-callback`;
}

export default getTrelloWebhookCallbackUrl;
