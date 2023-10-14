import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { TrelloModule } from 'src/trello/trello.module';
import { TrelloService } from 'src/trello/trello.service';
import { BotController } from './bot.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [BotController],
  providers: [BotService, UsersService, TrelloService],
  imports: [UsersModule, TrelloModule, HttpModule],
})
export class BotModule {}
