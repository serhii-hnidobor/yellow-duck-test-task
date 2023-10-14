import {
  Body,
  Controller,
  Get,
  Head,
  HttpCode,
  Inject,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthCallbackQueryDto } from './dto/callback.dto';
import { BotService } from './bot.service';
import { WebhookEventDto } from './dto/web-hook-callback.dto';
import { TrelloWebhookGuard } from './guards/trello-webhook-guard';

@Controller('bot')
export class BotController {
  @Inject(BotService)
  private readonly botService: BotService;

  @Get('/callback')
  authCallback(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: AuthCallbackQueryDto,
  ) {
    return this.botService.trelloAuthCallback(query);
  }

  @Post('/webhook-callback')
  @UsePipes(new ValidationPipe({ transform: true }))
  webhookCallback(@Body() body: WebhookEventDto) {
    return this.botService.webHookCallback(body);
  }

  @UseGuards(TrelloWebhookGuard)
  @Head('/webhook-callback')
  @HttpCode(200)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  webhookCallbackHeathCheck() {}
}
