import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TerminusModule } from '@nestjs/terminus';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import getEnvPath from './utils/get-env-path';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegrafConfigService } from './shared/telegraph/telegraf-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { TrelloService } from './trello/trello.service';
import { TrelloModule } from './trello/trello.module';
import { HttpModule } from '@nestjs/axios';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    TerminusModule,
    BotModule,
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TelegrafModule.forRootAsync({
      useClass: TelegrafConfigService,
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    UsersModule,
    TrelloModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [UsersService, TrelloService],
})
export class AppModule {}
