import { jest, mock } from "bun:test"

import {
  ApplicationCommand,
  ApplicationCommandType,
  Client,
  DMChannel,
  InteractionType,
  Locale,
  Message,
  PermissionsBitField,
  User,
  UserFlagsBitField,
  type UserMention,
} from "discord.js"

import { faker } from "@faker-js/faker"
import { Command, CommandStore, container } from "@sapphire/framework"
import type { DeepPartial } from "@sapphire/utilities"

export class FakerGenerator {
  static generatePiece() {
    return {
      name: faker.string.alpha(10),
      store: container?.utilities?.store ?? {},
      path: faker.system.filePath(),
      root: faker.system.directoryPath(),
    }
  }

  static generateLoaderContext(): Command.LoaderContext {
    return {
      name: faker.string.alpha(10),
      store: new CommandStore(),
      path: faker.system.filePath(),
      root: faker.system.directoryPath(),
    }
  }

  static generateInteraction(
    options?: DeepPartial<Command.ChatInputCommandInteraction>,
  ): Command.ChatInputCommandInteraction {
    return {
      id: faker.string.uuid(),
      applicationId: faker.string.uuid(),
      channelId: faker.string.uuid(),
      user: FakerGenerator.generateUser(),
      guildId: faker.string.uuid(),
      commandType: ApplicationCommandType.ChatInput,
      type: InteractionType.ApplicationCommand,
      command: FakerGenerator.generateCommand(),
      commandId: faker.string.uuid(),
      commandName: faker.lorem.words(2),
      commandGuildId: faker.string.uuid(),
      deferred: faker.datatype.boolean(),
      ephemeral: faker.datatype.boolean(),
      replied: faker.datatype.boolean(),
      channel: null,
      context: null,
      createdAt: faker.date.past(),
      createdTimestamp: Date.now(),
      guild: null,
      member: null,
      token: "",
      version: 0,
      memberPermissions: null,
      locale: Locale.French,
      guildLocale: null,
      attachmentSizeLimit: 0,
      options: {},
      ...options,
    } as unknown as Command.ChatInputCommandInteraction
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
    return {
      id: faker.string.uuid(),
      applicationId: faker.string.uuid(),
      guildId: faker.string.uuid(),
      type: ApplicationCommandType.ChatInput,
      createdAt: faker.date.past(),
      createdTimestamp: Date.now(),
      guild: null,
      version: `v${faker.number.int({ min: 1, max: 100 })}`,
      contexts: [],
      client: container.client as unknown as Client<true>,
      defaultMemberPermissions: new PermissionsBitField(PermissionsBitField.Flags.SendMessages),
      description: faker.lorem.sentence(),
      options: [],
      descriptionLocalizations: {},
      descriptionLocalized: faker.lorem.sentence(),
      dmPermission: true,
      ...options,
    } as unknown as ApplicationCommand<{}>
  }

  static generateUser(options?: DeepPartial<User>): User {
    return {
      id: faker.string.uuid(),
      username: faker.internet.userName(),
      discriminator: faker.string.numeric(4),
      bot: faker.datatype.boolean(),
      system: false,
      accentColor: faker.datatype.boolean() ? faker.number.int({ min: 0, max: 0xffffff }) : null,
      avatar: faker.datatype.boolean() ? faker.string.alphanumeric(32) : null,
      avatarDecoration: null,
      avatarDecorationData: null,
      banner: null,
      globalName: faker.datatype.boolean() ? faker.person.fullName() : null,
      flags: null,
      createdAt: faker.date.past(),
      createdTimestamp: Date.now(),
      displayName: faker.internet.userName(),
      defaultAvatarURL: faker.internet.url(),
      dmChannel: null,
      hexAccentColor: null,
      partial: false,
      tag: `${faker.internet.userName()}#${faker.string.numeric(4)}`,
      avatarURL: mock(() => faker.internet.url()),
      avatarDecorationURL: mock(() => null),
      bannerURL: mock(() => null),
      displayAvatarURL: mock(() => faker.internet.url()),
      equals: mock(() => false),
      createDM: mock(async () => null) as unknown as (
        force?: boolean | undefined,
      ) => Promise<DMChannel>,
      deleteDM: mock(async () => null) as unknown as () => Promise<DMChannel>,
      fetch: mock(async () => null) as unknown as (force?: boolean | undefined) => Promise<User>,
      fetchFlags: mock(async () => null) as unknown as () => Promise<UserFlagsBitField>,
      toString: mock(() => `<@${faker.string.uuid()}>`) as unknown as () => UserMention,
      toJSON: mock(() => ({})) as unknown as () => Record<string, unknown>,
      client: container.client as unknown as Client<true>,
      send: mock(async () => null) as unknown as (
        content: string,
        options?: any,
      ) => Promise<Message<false>>,
      ...options,
    } as unknown as User
  }
}
