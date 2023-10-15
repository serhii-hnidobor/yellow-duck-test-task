import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { Ctx, InjectBot, On, Start, Update, Hears } from 'nestjs-telegraf';
import { UsersService } from 'src/users/users.service';
import { Telegraf, Context } from 'telegraf';
import { TelegrafUser, TrelloWebHookData } from './bot.types';
import { TrelloService } from 'src/trello/trello.service';
import { AuthCallbackQueryDto } from './dto/callback.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { WebhookEventDto } from './dto/web-hook-callback.dto';
import getTrelloWebhookCallbackUrl from 'src/utils/get-trello-webhook-callback-url';
import isUrlSame from 'src/utils/is-url-same';
import { User } from 'src/users/user.entity';
import tableToImage from 'src/utils/table-to-image';
import { CTCustomCell, CTColumn } from 'canvas-table';

@Update()
export class BotService implements OnApplicationBootstrap {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  constructor(
    @InjectBot() private bot: Telegraf,
    @Inject(UsersService) private userService: UsersService,
    @Inject(TrelloService)
    private trelloService: TrelloService,
    private readonly httpService: HttpService,
  ) {}

  async onApplicationBootstrap() {
    const trelloApiKey = this.config.getOrThrow<string>('TRELLO_API_KEY');
    const targetBoardId = this.config.getOrThrow<string>('BOARD_ID');
    const nodeEnv = this.config.get<string | undefined>('NODE_ENV');
    const boardAccessToken = this.config.getOrThrow<string>(
      'TRELLO_BOARD_ACCESS_TOKEN',
    );
    const apiUrl = this.config.getOrThrow<string>('API_URL');

    const hookCallbackUrl = getTrelloWebhookCallbackUrl(apiUrl);

    this.bot.telegram.setMyCommands([
      {
        command: 'check_trello_auth',
        description: 'Перевірити чи привязаний аккаунт трелло',
      },
      {
        command: 'connect_trello',
        description:
          'Привязати аккаунт трелло (працює тільки в особистій препискі з ботом)',
      },
      {
        command: 'get_stat',
        description: 'Отримати статистику завдань користувачів цієї групи',
      },
      {
        command: 'register_public_group',
        description: 'Зареєструвати групу',
      },
    ]);

    if (nodeEnv?.toLowerCase() === 'local') {
      return;
    }

    try {
      const { data: existHooksData } = await this.httpService.axiosRef.get<
        TrelloWebHookData[]
      >(
        `https://api.trello.com/1/tokens/${boardAccessToken}/webhooks/?key=${trelloApiKey}`,
      );

      for (const { id, active, callbackURL } of existHooksData) {
        if (isUrlSame(callbackURL, hookCallbackUrl) && active) {
          await this.deleteTrelloWebhook(id, trelloApiKey, boardAccessToken);
        }
      }

      await this.httpService.axiosRef.post(
        `https://api.trello.com/1/tokens/${boardAccessToken}/webhooks/?key=${trelloApiKey}`,
        {
          description: 'app webhook',
          callbackURL: hookCallbackUrl,
          idModel: targetBoardId,
        },
      );
    } catch (error) {
      console.error(error);
    }
  }

  async deleteTrelloWebhook(hookId: string, apiKey: string, token: string) {
    try {
      await this.httpService.axiosRef.post(
        `https://api.trello.com/1/webhooks/${hookId}?key=${apiKey}&token=APIToken=${token}`,
      );
    } catch (error) {
      console.error(`delete trello webhook error - ${error}`);
    }
  }

  @Start()
  private async start(@Ctx() ctx: Context) {
    const { is_bot, id, first_name, username } = ctx.message.from;

    if (is_bot) {
      return;
    }

    await this.userService.createUser({
      telegramId: id,
      firstName: first_name,
      username,
    });

    await ctx.reply(`Вітаю, ${first_name}`);
  }

  private sendMessage(chatId: number, message: string) {
    return this.bot.telegram.sendMessage(chatId, message);
  }

  async trelloAuthCallback(callbackDto: AuthCallbackQueryDto) {
    await this.trelloService.authCallback(callbackDto);

    const { oauth_token } = callbackDto;

    const { privateChatId, telegramId } =
      await this.userService.getUserByOauthToken(oauth_token);

    const { id: trelloUserId } =
      await this.trelloService.getTrelloUserByTelegramUserId(telegramId);

    await this.userService.addTrelloUserId(telegramId, trelloUserId);

    if (!privateChatId) {
      return;
    }

    await this.sendMessage(
      privateChatId,
      'ви успішно прив`язали акаунт trello',
    );
  }

  getPrivateAndPublicChatId(ctx: Context) {
    const isPrivateChat = this.isPrivateChat(ctx);

    const chatId = ctx.chat.id;

    const privateChatId = isPrivateChat ? chatId : undefined;
    const publicChatId = isPrivateChat ? undefined : chatId;

    return {
      privateChatId,
      publicChatId,
    };
  }

  @On('new_chat_members')
  private async handleNewUser(@Ctx() ctx: Context) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newMembers: TelegrafUser[] = ctx.message.new_chat_members;

    for (const { is_bot, id, first_name, username } of newMembers) {
      const { privateChatId, publicChatId } =
        this.getPrivateAndPublicChatId(ctx);

      if (is_bot) {
        return;
      }

      await this.userService.createUser({
        telegramId: id,
        firstName: first_name,
        username,
        privateChatId,
        publicChatId,
      });

      await ctx.reply(`Вітаю, ${first_name}`);
    }
  }

  private isPrivateChat(ctx: Context) {
    return ctx.message.chat.type === 'private';
  }

  private isBot(ctx: Context) {
    return ctx.message.from.is_bot;
  }

  @Hears(['/check_trello_auth@yellow_duck_test_task_bot', '/check_trello_auth'])
  async checkTrelloAuth(@Ctx() ctx: Context) {
    const telegramUserId = ctx.message.from.id;

    const trelloUser = await this.trelloService.getTrelloUserByTelegramUserId(
      telegramUserId,
    );

    if (!trelloUser) {
      ctx.reply('Ви не прив`язали аккаунт трелло');
      return;
    }

    ctx.reply('Ви прив`язали аккаунт трелло');
  }

  @Hears(['/connect_trello@yellow_duck_test_task_bot', '/connect_trello'])
  async connectTrello(@Ctx() ctx: Context) {
    const isPrivateChat = this.isPrivateChat(ctx);
    const telegramUserId = ctx.message.from.id;
    const isBot = this.isBot(ctx);

    if (!isPrivateChat || isBot) {
      ctx.reply('Ця команда доступна лише в приватній перепискі з ботом');
      return;
    }

    const isUserExist = await this.userService.isUserExistByTelegramId(
      telegramUserId,
    );

    if (!isUserExist) {
      ctx.reply('Користувач не знайдений');
      return;
    }

    const privateChatId = ctx.chat.id;

    await this.userService.addChatId(telegramUserId, privateChatId);

    const authUrl = await this.trelloService.getAuthUrl(telegramUserId);

    await ctx.reply(
      `Перейдіть по цьому посиланню для підключення trello аккаунту, ${authUrl}`,
    );
  }

  generateStatTableData(
    userCardListMap: Record<string, unknown>,
    allUserFromGroup: User[],
  ) {
    const statTableData: Array<CTCustomCell[]> = [];
    const statTableHeaderData = [this.addStyleToTableHeaderValue('Name')];

    for (const listName in userCardListMap) {
      const headerValue = this.addStyleToTableHeaderValue(listName);
      statTableHeaderData.push(headerValue);
    }

    const listNames = Object.keys(userCardListMap);

    for (const user of allUserFromGroup) {
      const values = listNames.map((listName) => {
        const usersListStat = userCardListMap[listName] as Record<
          string,
          number
        >;

        return String(usersListStat[user?.trelloUserId] || 0);
      });

      const tableRowData = [user.firstName, ...values];

      const styledRowData = this.addStyleToTableValue(tableRowData);

      statTableData.push(styledRowData);
    }

    return {
      statTableData,
      statTableHeaderData,
    };
  }

  private addStyleToTableValue(values: string[]): CTCustomCell[] {
    return values.map((value) => ({
      value,
      textAlign: 'center',
      fontSize: 14,
      fontFamily: 'serif',
      fontWeight: '400',
      lineHeight: 1,
      color: 'black',
    }));
  }

  private addStyleToTableHeaderValue(headerValue: string): CTColumn {
    return {
      title: headerValue,
      options: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'serif',
        lineHeight: 1,
        color: '#222',
      },
    };
  }

  @Hears(['/get_stat@yellow_duck_test_task_bot', '/get_stat'])
  async getStat(@Ctx() ctx: Context) {
    const isBot = this.isBot(ctx);
    const { publicChatId } = this.getPrivateAndPublicChatId(ctx);

    if (isBot || !publicChatId) {
      ctx.reply('Ця команда доступна лише в публічній групі');
      return;
    }

    const trelloApiKey = this.config.getOrThrow<string>('TRELLO_API_KEY');
    const targetBoardId = this.config.getOrThrow<string>('BOARD_ID');
    const boardAccessToken = this.config.getOrThrow<string>(
      'TRELLO_BOARD_ACCESS_TOKEN',
    );

    const groupTrelloConfirmedUserTrelloIds = (
      await this.userService.getGroupTrelloConfirmedUser(publicChatId)
    ).map(({ trelloUserId }) => trelloUserId);

    const allUserFromGroup = await this.userService.getAllUserFromPublicChat(
      publicChatId,
    );

    try {
      const boardMembers = await this.trelloService.getBoardMembers(
        targetBoardId,
        trelloApiKey,
        boardAccessToken,
      );

      const boardMembersTrelloIds = boardMembers
        .filter(({ id: userTrelloId }) =>
          groupTrelloConfirmedUserTrelloIds.includes(userTrelloId),
        )
        .map(({ id }) => id);

      const userCardListMap =
        await this.trelloService.countUserCardInSpecificLists({
          trelloUserIds: boardMembersTrelloIds,
          boardId: targetBoardId,
          listNames: ['Done', 'InProgress'],
        });

      const { statTableData, statTableHeaderData } = this.generateStatTableData(
        userCardListMap,
        allUserFromGroup,
      );

      const statTableImage = await tableToImage(
        statTableData,
        statTableHeaderData,
      );

      ctx.replyWithPhoto({ source: statTableImage });
    } catch (error) {
      console.error(error);
      return;
    }
  }

  @Hears([
    '/register_public_group',
    '/register_public_group@yellow_duck_test_task_bot',
  ])
  async registerPublicGroup(@Ctx() ctx: Context) {
    const telegramUserId = ctx.message.from.id;
    const isBot = this.isBot(ctx);

    const { publicChatId } = this.getPrivateAndPublicChatId(ctx);

    if (!publicChatId || isBot) {
      ctx.reply('Ця команда доступна лише в публічній групі');
      return;
    }

    await this.userService.addChatId(telegramUserId, undefined, publicChatId);

    ctx.reply(
      'група успішно зараєсторвана! Тепер ви будете отримувати сповіщення тут.',
    );
  }

  isWebHookActionMoveCard(type: string, translationKey: string) {
    return (
      type === 'updateCard' &&
      translationKey === 'action_move_card_from_list_to_list'
    );
  }

  async webHookCallback(payload: WebhookEventDto) {
    const { type } = payload.action;

    const { translationKey } = payload.action.display;

    const isMoveCard = this.isWebHookActionMoveCard(type, translationKey);

    if (!isMoveCard) {
      return;
    }

    const { username: actionAuthorUsername } =
      payload.action.display.entities.memberCreator;

    const { name: movedCardName } = payload.action.data.card;
    const { name: targetListName } = payload.action.data.listAfter;

    const publicChatsIds = await this.userService.getAllPublicChatIds();

    const message = `Користувач ${actionAuthorUsername} перемістив картку ${movedCardName} до списку ${targetListName}`;

    for (const publicChatId of publicChatsIds) {
      await this.sendMessage(publicChatId, message);
    }
  }
}
