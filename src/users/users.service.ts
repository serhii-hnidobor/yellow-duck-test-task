import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.findOneBy({
      telegramId: dto.telegramId,
    });

    if (user) {
      return;
    }

    return this.userRepository.save(dto);
  }

  getUserByTelegramId(telegramUserId: number) {
    return this.userRepository.findOneBy({
      telegramId: telegramUserId,
    });
  }

  getUserByOauthToken(oauthToken: string) {
    return this.userRepository.findOneBy({
      oauthToken,
    });
  }

  async isUserExistByTelegramId(telegramUserId: number) {
    return !!(await this.getUserByTelegramId(telegramUserId));
  }

  async addOauthTokensData(
    telegramUserId: number,
    oauthToken: string,
    oauthTokenSecret: string,
  ) {
    const user = await this.userRepository.findOneBy({
      telegramId: telegramUserId,
    });

    if (!user) {
      return;
    }

    return this.userRepository.save({
      ...user,
      oauthToken,
      oauthTokenSecret,
    });
  }

  async addChatId(
    telegramUserId: number,
    privateChatId?: number,
    publicChatId?: number,
  ) {
    const user = await this.userRepository.findOneBy({
      telegramId: telegramUserId,
    });

    if (!user) {
      return;
    }

    return this.userRepository.save({ ...user, privateChatId, publicChatId });
  }

  getGroupTrelloConfirmedUser(publicChatId: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.publicChatId = :publicChatId', { publicChatId })
      .andWhere('user.accessToken IS NOT NULL')
      .andWhere('user.trelloUserId IS NOT NULL')
      .select('user.trelloUserId')
      .getMany();
  }

  getAllUserFromPublicChat(publicChatId: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.publicChatId = :publicChatId', { publicChatId })
      .select([
        'user.id',
        'user.firstName',
        'user.username',
        'user.trelloUserId',
      ])
      .getMany();
  }

  async addTrelloUserId(telegramUserId: number, trelloUserId: string) {
    const user = await this.userRepository.findOneBy({
      telegramId: telegramUserId,
    });

    if (!user) {
      return;
    }

    return this.userRepository.save({
      ...user,
      trelloUserId,
    });
  }

  async getAllPublicChatIds() {
    const usersWithPublicChatIdNotNull = await this.userRepository
      .createQueryBuilder('user')
      .where('user.publicChatId IS NOT NULL')
      .select('user.publicChatId')
      .getMany();

    return usersWithPublicChatIdNotNull.map(({ publicChatId }) => publicChatId);
  }

  async addAccessToken(
    oauthToken: string,
    accessToken: string,
    accessTokenSecret: string,
  ) {
    const user = await this.userRepository.findOneBy({
      oauthToken,
    });

    if (!user) {
      return;
    }

    return this.userRepository.save({
      ...user,
      accessToken,
      accessTokenSecret,
    });
  }

  async getOauthSecretToken(oauthToken: string) {
    const user = await this.userRepository.findOneBy({ oauthToken });

    if (!user?.oauthTokenSecret) {
      return null;
    }

    return user.oauthTokenSecret;
  }
}
