import { jest, mock } from "bun:test"

import {
  ApplicationCommand,
  ApplicationCommandType,
  InteractionType,
  Locale,
  ModalSubmitInteraction,
  PermissionsBitField,
  User,
} from "discord.js"

import { faker } from "@faker-js/faker"
import { Command, CommandStore, container } from "@sapphire/framework"
import type { DeepPartial } from "@sapphire/utilities"
import { buildCustomId } from "../utils/discord.util"
import type { PaginationStore } from "../types/store.types"
import { GameMode, BeatmapStatusWeb } from "../types/api"
import type { ScoreResponse, BeatmapResponse, UserResponse } from "../types/api"

function autoMock<T extends object>(base: Partial<T>): T {
  return new Proxy(base as T, {
    get(target: any, prop: string | symbol) {
      if (prop in target) {
        return target[prop]
      }

      return mock(async (...args: any[]) => null)
    },
  }) as unknown as T
}

const createBaseEntity = () => ({
  id: faker.string.uuid(),
  createdAt: faker.date.past(),
  createdTimestamp: Date.now(),
})

const createBaseInteraction = () => ({
  ...createBaseEntity(),
  applicationId: faker.string.uuid(),
  channelId: faker.string.uuid(),
  guildId: faker.string.uuid(),
  locale: Locale.French,
})

export class FakerGenerator {
  static generatePiece() {
    return {
      name: faker.string.alpha(10),
      store: container?.utilities?.store ?? {},
      path: faker.system.filePath(),
      root: faker.system.directoryPath(),
    }
  }

  static generateLoaderContext() {
    return {
      name: faker.string.alpha(10),
      store: new CommandStore(),
      path: faker.system.filePath(),
      root: faker.system.directoryPath(),
    }
  }

  static generateCustomId(
    options?: Partial<{
      prefix: string
      userId: string
      ctx: {
        dataStoreId?: string | undefined
        data?: string[] | undefined
      }
    }>,
  ) {
    return buildCustomId(
      options?.prefix ?? faker.lorem.word({ length: { min: 0, max: 10 } }),
      options?.userId ?? faker.number.int().toString(),
      {
        data: options?.ctx?.data ?? undefined,
        dataStoreId: options?.ctx?.dataStoreId ?? undefined,
      },
    )
  }

  static generateInteraction(
    options?: DeepPartial<Command.ChatInputCommandInteraction>,
  ): Command.ChatInputCommandInteraction {
    return autoMock<Command.ChatInputCommandInteraction>({
      ...createBaseInteraction(),
      user: options?.user ?? FakerGenerator.generateUser(),
      commandType: ApplicationCommandType.ChatInput,
      type: InteractionType.ApplicationCommand,
      command: options?.command ?? FakerGenerator.generateCommand(),
      commandId: faker.string.uuid(),
      commandName: faker.lorem.words(2),
      commandGuildId: faker.string.uuid(),
      deferred: faker.datatype.boolean(),
      ephemeral: faker.datatype.boolean(),
      replied: faker.datatype.boolean(),
      ...(options as any),
    })
  }

  static generateModalSubmitInteraction(
    options?: DeepPartial<ModalSubmitInteraction>,
  ): ModalSubmitInteraction {
    return autoMock<ModalSubmitInteraction>({
      ...createBaseInteraction(),
      user: options?.user ?? FakerGenerator.generateUser(),
      type: InteractionType.ModalSubmit,
      customId: faker.lorem.slug(),
      deferred: faker.datatype.boolean(),
      ephemeral: faker.datatype.boolean(),
      replied: faker.datatype.boolean(),
      ...(options as any),
    })
  }

  static withSubcommand<T extends Command.ChatInputCommandInteraction>(
    interaction: T,
    subcommand: string,
  ): T {
    interaction.options.getSubcommand = jest.fn().mockReturnValue(subcommand)
    interaction.options.getSubcommandGroup = jest.fn().mockReturnValue(null)

    return interaction
  }

  static generateCommand(options?: DeepPartial<ApplicationCommand<{}>>): ApplicationCommand<{}> {
    return autoMock<ApplicationCommand<{}>>({
      ...createBaseEntity(),
      applicationId: faker.string.uuid(),
      guildId: faker.string.uuid(),
      type: ApplicationCommandType.ChatInput,
      version: `v${faker.number.int({ min: 1, max: 100 })}`,
      client: container.client as any,
      defaultMemberPermissions: new PermissionsBitField(PermissionsBitField.Flags.SendMessages),
      description: faker.lorem.sentence(),
      ...(options as any),
    })
  }

  static generateUser(options?: DeepPartial<User>): User {
    const userId = options?.id ?? faker.string.uuid()
    const username = options?.username ?? faker.internet.username()

    return autoMock<User>({
      ...createBaseEntity(),
      id: userId,
      username,
      discriminator: faker.string.numeric(4),
      bot: faker.datatype.boolean(),
      system: false,
      displayName: username,
      defaultAvatarURL: faker.internet.url(),
      tag: `${username}#${faker.string.numeric(4)}`,
      client: container.client as any,
      avatarURL: () => faker.internet.url(),
      displayAvatarURL: () => faker.internet.url(),
      toString: () => `<@${userId}>`,
      ...(options as any),
    })
  }

  static generatePaginationData(options?: DeepPartial<PaginationStore>): PaginationStore {
    return autoMock<PaginationStore>({
      handleSetPage:
        options?.handleSetPage ?? mock(async (state: any) => ({ embed: {}, buttonsRow: {} })),
      state: {
        pageSize: options?.state?.pageSize ?? 10,
        totalPages: options?.state?.totalPages ?? 5,
        currentPage: options?.state?.currentPage ?? 1,
        ...(options?.state as any),
      },
      ...(options as any),
    })
  }

  static generateOsuUser(options?: Partial<UserResponse>): UserResponse {
    return {
      user_id: faker.number.int({ min: 1, max: 1000000 }),
      username: faker.internet.username(),
      country_code: faker.location.countryCode(),
      avatar_url: faker.internet.url(),
      banner_url: faker.internet.url(),
      register_date: new Date().toISOString(),
      last_online_time: new Date().toISOString(),
      restricted: false,
      silenced_until: null,
      default_gamemode: GameMode.STANDARD,
      badges: [],
      user_status: "online",
      description: null,
      ...options,
    }
  }

  static generateScore(options?: Partial<ScoreResponse>): ScoreResponse {
    const mockUser = options?.user ?? FakerGenerator.generateOsuUser()

    return {
      id: faker.number.int({ min: 1, max: 1000000 }),
      beatmap_id: faker.number.int({ min: 1, max: 1000000 }),
      user_id: mockUser.user_id,
      user: mockUser,
      total_score: faker.number.int({ min: 1000000, max: 100000000 }),
      max_combo: faker.number.int({ min: 100, max: 2000 }),
      count_300: faker.number.int({ min: 100, max: 1000 }),
      count_100: faker.number.int({ min: 10, max: 100 }),
      count_50: faker.number.int({ min: 0, max: 50 }),
      count_miss: faker.number.int({ min: 0, max: 10 }),
      count_geki: faker.number.int({ min: 0, max: 100 }),
      count_katu: faker.number.int({ min: 0, max: 100 }),
      performance_points: faker.number.float({ min: 100, max: 1000 }),
      grade: ["S", "A", "B", "C", "D", "F"][faker.number.int({ min: 0, max: 5 })] as string,
      accuracy: faker.number.float({ min: 90, max: 100 }),
      game_mode: GameMode.STANDARD,
      game_mode_extended: GameMode.STANDARD,
      is_passed: true,
      has_replay: true,
      is_perfect: false,
      when_played: new Date().toISOString(),
      mods: null,
      mods_int: 0,
      leaderboard_rank: null,
      ...options,
    }
  }

  static generateBeatmap(options?: Partial<BeatmapResponse>): BeatmapResponse {
    return {
      id: faker.number.int({ min: 1, max: 1000000 }),
      beatmapset_id: faker.number.int({ min: 1, max: 100000 }),
      hash: faker.string.alphanumeric(32),
      version: faker.word.adjective(),
      status: BeatmapStatusWeb.RANKED,
      star_rating_osu: faker.number.float({ min: 1, max: 10 }),
      star_rating_taiko: faker.number.float({ min: 1, max: 10 }),
      star_rating_ctb: faker.number.float({ min: 1, max: 10 }),
      star_rating_mania: faker.number.float({ min: 1, max: 10 }),
      total_length: faker.number.int({ min: 60, max: 600 }),
      max_combo: faker.number.int({ min: 100, max: 2000 }),
      accuracy: faker.number.float({ min: 1, max: 10 }),
      ar: faker.number.float({ min: 1, max: 10 }),
      bpm: faker.number.float({ min: 80, max: 200 }),
      convert: false,
      count_circles: faker.number.int({ min: 100, max: 1000 }),
      count_sliders: faker.number.int({ min: 50, max: 500 }),
      count_spinners: faker.number.int({ min: 0, max: 10 }),
      cs: faker.number.float({ min: 1, max: 10 }),
      deleted_at: null,
      drain: faker.number.float({ min: 1, max: 10 }),
      hit_length: faker.number.int({ min: 60, max: 600 }),
      is_scoreable: true,
      is_ranked: true,
      last_updated: new Date().toISOString(),
      mode_int: 0,
      mode: GameMode.STANDARD,
      ranked: 1,
      title: faker.music.songName(),
      artist: faker.person.fullName(),
      creator: faker.internet.username(),
      creator_id: faker.number.int({ min: 1, max: 100000 }),
      beatmap_nominator_user: undefined,
      ...options,
    }
  }
}
