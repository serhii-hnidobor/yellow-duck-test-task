import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';

@Injectable()
export class TelegrafConfigService implements TelegrafOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  createTelegrafOptions(): TelegrafModuleOptions {
    return {
      token: this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
    };
  }
}
