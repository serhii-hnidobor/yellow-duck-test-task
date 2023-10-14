import { Module } from '@nestjs/common';
import { TrelloService } from './trello.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [UsersModule, HttpModule],
  providers: [TrelloService, UsersService],
})
export class TrelloModule {}
