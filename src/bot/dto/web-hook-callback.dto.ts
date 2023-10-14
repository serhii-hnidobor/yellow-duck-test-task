import { Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsUrl,
  IsObject,
  ValidateNested,
  IsNumber,
} from 'class-validator';

export class WebhookEventDto {
  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ModelDto)
  public model: ModelDto;

  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => WebhookDto)
  public webhook: WebhookDto;

  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ActionDto)
  public action: ActionDto;
}

class ModelDto {
  @IsString()
  public id: string;

  @IsString()
  public name: string;

  @IsString()
  public desc: string;
}

// WEBHOOK DTO

class WebhookDto {
  @IsString()
  public id: string;

  @IsString()
  public description: string;

  @IsString()
  public idModel: string;

  @IsUrl()
  public callbackURL: string;

  @IsBoolean()
  public active: boolean;

  @IsNumber()
  public consecutiveFailures: number;
}

// ACTION DTO

class ActionDto {
  @IsString()
  public id: string;

  @IsString()
  public idMemberCreator: string;

  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ActionDataDto)
  public data: ActionDataDto;

  @IsString()
  public type: string;

  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ActionDisplayDto)
  public display: ActionDisplayDto;
}

class ActionDataDto {
  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => CardDto)
  public card: CardDto;

  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ListAfterDto)
  listAfter: ListAfterDto;
}

class ListAfterDto {
  @IsString()
  public id: string;

  @IsString()
  public name: string;
}

class ActionDisplayDto {
  @IsString()
  public translationKey: string;

  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ActionDisplayEntitiesDto)
  entities: ActionDisplayEntitiesDto;
}

class ActionDisplayEntitiesDto {
  @ValidateNested({ each: true })
  @IsObject()
  @Type(() => ActionCreatorDto)
  memberCreator: ActionCreatorDto;
}

class ActionCreatorDto {
  @IsString()
  type: string;

  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  text: string;
}

// CARD DTO

class CardDto {
  @IsString()
  public idList: string;

  @IsString()
  public id: string;

  @IsString()
  public name: string;

  @IsNumber()
  public idShort: number;

  @IsString()
  public shortLink: string;
}
