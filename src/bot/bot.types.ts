export interface TelegrafUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
  is_premium?: boolean;
}

export interface TrelloWebHookData {
  id: string;
  description: string;
  idModel: string;
  callbackURL: string;
  active: true;
  consecutiveFailures: string;
  firstConsecutiveFailDate: string;
}
