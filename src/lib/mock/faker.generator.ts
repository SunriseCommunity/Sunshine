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
  channel: null,
  guild: null,
  member: null,
  token: "",
  version: 0,
  memberPermissions: null,
  locale: Locale.French,
  guildLocale: null,
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
      context: null,
      attachmentSizeLimit: 0,
      options: options?.options ?? {},
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
      isFromMessage: false,
      message: options?.message ?? null,
      fields: [],
      isModalSubmit: () => true,
      isButton: () => false,
      isSelectMenu: () => false,
      isAutocomplete: () => false,
      isCommand: () => false,
      isContextMenuCommand: () => false,
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
      guild: null,
      version: `v${faker.number.int({ min: 1, max: 100 })}`,
      contexts: [],
      client: container.client as any,
      defaultMemberPermissions: new PermissionsBitField(PermissionsBitField.Flags.SendMessages),
      description: faker.lorem.sentence(),
      options: [],
      descriptionLocalizations: {},
      descriptionLocalized: faker.lorem.sentence(),
      dmPermission: true,
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
      partial: false,
      tag: `${username}#${faker.string.numeric(4)}`,
      client: container.client as any,
      avatarURL: () => faker.internet.url(),
      displayAvatarURL: () => faker.internet.url(),
      toString: () => `<@${userId}>`,
      ...(options as any),
    })
  }
}
