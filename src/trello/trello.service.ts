import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth } from 'oauth';
import { UsersService } from 'src/users/users.service';
import { AuthCallbackQueryDto } from '../bot/dto/callback.dto';
import { HttpService } from '@nestjs/axios';
import {
  TrelloBoardListType,
  TrelloBoardMember,
  TrelloCardType,
  TrelloUser,
} from './trello.types';
import isStringSame from 'src/utils/is-string-same';

const requestURL = 'https://trello.com/1/OAuthGetRequestToken';
const accessURL = 'https://trello.com/1/OAuthGetAccessToken';
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken';
const appName = 'yellow-duck-test-task';
const scope = 'read';

interface CountUserCardInSpecificListsArg {
  trelloUserIds: string[];
  listNames: string[];
  boardId: string;
}

@Injectable()
export class TrelloService {
  @Inject(UsersService)
  private readonly userService: UsersService;

  @Inject(HttpService)
  private readonly httpService: HttpService;

  private oauth: OAuth;

  constructor(private readonly config: ConfigService) {
    const apiUrl = this.config.getOrThrow('API_URL');

    this.oauth = new OAuth(
      requestURL,
      accessURL,
      this.config.getOrThrow<string>('TRELLO_API_KEY'),
      this.config.getOrThrow<string>('TRELLO_API_SECRET'),
      '1.0A',
      `${apiUrl}/bot/callback`,
      'HMAC-SHA1',
    );
  }

  getAuthUrl(userId: number) {
    return new Promise<string>((resolve) =>
      this.oauth.getOAuthRequestToken((error, token, tokenSecret) => {
        this.userService
          .addOauthTokensData(userId, token, tokenSecret)
          .then(() =>
            resolve(
              `${authorizeURL}?oauth_token=${token}&name=${appName}&scope=${scope}`,
            ),
          );
      }),
    );
  }

  async getTrelloAuthHeader(
    telegramUserId: number,
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  ) {
    const user = await this.userService.getUserByTelegramId(telegramUserId);

    if (!user?.accessToken || !user?.accessTokenSecret) {
      return null;
    }

    const { accessToken, accessTokenSecret } = user;

    return this.oauth.authHeader(url, accessToken, accessTokenSecret, method);
  }

  async getTrelloUserByTelegramUserId(
    telegramUserId: number,
  ): Promise<TrelloUser | null> {
    const url = 'https://api.trello.com/1/members/me';

    const authHeader = await this.getTrelloAuthHeader(
      telegramUserId,
      url,
      'GET',
    );

    try {
      const res = await this.httpService.axiosRef.get<TrelloUser>(url, {
        headers: { Authorization: authHeader },
      });

      return res.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private getListsIdByNames(
    listsData: TrelloBoardListType[],
    searchedListNames: string[],
  ) {
    const res: Record<string, string> = {};

    for (const searchedListName of searchedListNames) {
      const searchedList = listsData.find(({ name }) =>
        isStringSame(name, searchedListName),
      );

      if (!searchedList) {
        continue;
      }

      res[searchedListName] = searchedList.id;
    }

    return res;
  }

  async getBoardMembers(
    boardId: string,
    trelloApiKey: string,
    accessToken: string,
  ) {
    const { data: boardMembers } = await this.httpService.axiosRef.get<
      TrelloBoardMember[]
    >(
      `https://api.trello.com/1/boards/${boardId}/members?key=${trelloApiKey}&token=${accessToken}`,
    );

    return boardMembers;
  }

  private async getListCards(
    listId: string,
    trelloApiKey: string,
    accessToken: string,
  ) {
    try {
      const { data: listCards } = await this.httpService.axiosRef.get<
        TrelloCardType[]
      >(
        `https://api.trello.com/1/lists/${listId}/cards?key=${trelloApiKey}&token=${accessToken}`,
      );

      return listCards;
    } catch {
      return;
    }
  }

  private countUserCardInList(cards: TrelloCardType[], trelloUserId: string) {
    const userCards = cards.filter(({ idMembers }) =>
      idMembers.includes(trelloUserId),
    );

    return userCards.length;
  }

  async countUserCardInSpecificLists({
    trelloUserIds,
    boardId,
    listNames,
  }: CountUserCardInSpecificListsArg) {
    const trelloApiKey = this.config.getOrThrow<string>('TRELLO_API_KEY');
    const boardAccessToken = this.config.getOrThrow<string>(
      'TRELLO_BOARD_ACCESS_TOKEN',
    );

    const res = {};

    try {
      const { data: boardListData } = await this.httpService.axiosRef.get<
        TrelloBoardListType[]
      >(
        `https://api.trello.com/1/boards/${boardId}/lists?key=${trelloApiKey}&token=${boardAccessToken}`,
      );

      const listNamesMap = this.getListsIdByNames(boardListData, listNames);

      for (const listName in listNamesMap) {
        const listId = listNamesMap[listName];

        const listCards = await this.getListCards(
          listId,
          trelloApiKey,
          boardAccessToken,
        );

        res[listName] = {};

        trelloUserIds.forEach((trelloUserId) => {
          res[listName][trelloUserId] = this.countUserCardInList(
            listCards,
            trelloUserId,
          );
        });
      }

      return res;
    } catch {
      return;
    }
  }

  async authCallback({ oauth_token, oauth_verifier }: AuthCallbackQueryDto) {
    const oauthTokenSecret = await this.userService.getOauthSecretToken(
      oauth_token,
    );

    if (!oauthTokenSecret) {
      throw new UnauthorizedException();
    }

    return new Promise<void>((resolve) =>
      this.oauth.getOAuthAccessToken(
        oauth_token,
        oauthTokenSecret,
        oauth_verifier,
        (error, accessToken, accessTokenSecret) => {
          if (error) {
            throw new UnauthorizedException();
          }

          this.userService
            .addAccessToken(oauth_token, accessToken, accessTokenSecret)
            .then(() => resolve())
            .catch(() => {
              throw new UnauthorizedException();
            });
        },
      ),
    );
  }
}
