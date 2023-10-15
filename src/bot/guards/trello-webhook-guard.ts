import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import getTrelloWebhookCallbackUrl from 'src/utils/get-trello-webhook-callback-url';
import validateTrelloHookOrigin from 'src/utils/validate-trello-webhook';

@Injectable()
export class TrelloWebhookGuard implements CanActivate {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiUrl = this.configService.getOrThrow<string>('API_URL');
    const hookCallbackUrl = getTrelloWebhookCallbackUrl(apiUrl);
    const trelloSecret =
      this.configService.getOrThrow<string>('TRELLO_API_SECRET');

    return validateTrelloHookOrigin(request, trelloSecret, hookCallbackUrl);
  }
}
