import { Optional } from '@nestjs/common';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsNumber()
  public telegramId: number;

  @IsNotEmpty()
  @IsString()
  public firstName: string;

  @IsNotEmpty()
  @IsString()
  public username: string;

  @Optional()
  @IsString()
  public privateChatId?: number;

  @Optional()
  @IsString()
  public publicChatId?: number;
}
