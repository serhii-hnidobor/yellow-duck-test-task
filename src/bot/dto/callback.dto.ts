import { IsString } from 'class-validator';

export class AuthCallbackQueryDto {
  @IsString()
  public oauth_token: string;

  @IsString()
  public oauth_verifier: string;
}
