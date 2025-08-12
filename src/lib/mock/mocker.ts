import { mock } from "bun:test"

import { IntentsBitField } from "discord.js"
import { Database } from "bun:sqlite"
import { getMigrations, migrate } from "bun-sqlite-migrations"
import path from "path"

import { SapphireClient, LogLevel, container, Command, Events } from "@sapphire/framework"
import { EmbedPresetsUtility } from "../../utilities/embed-presets.utility"
import { PaginationUtility } from "../../utilities/pagination.utility"
import { UtilitiesStore } from "@sapphire/plugin-utilities-store"
import { ActionStoreUtility } from "../../utilities/action-store.utility"
import { FakerGenerator } from "./faker.generator"
import { faker } from "@faker-js/faker"
import { SubcommandPluginEvents } from "@sapphire/plugin-subcommands"

export class Mocker {
  static createSapphireClientInstance() {
    const client = new SapphireClient({
      intents: new IntentsBitField().add(IntentsBitField.Flags.Guilds),
      logger: { level: LogLevel.Debug },
    })

    container.client = client

    container.logger = {
      trace: mock(),
      write: mock(),
      fatal: mock(),
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      has: mock((level: LogLevel) => {
        return level === LogLevel.Debug
      }),
    }

    container.utilities = {
      ...container.utilities,
      store: new UtilitiesStore(),
      exposePiece(name, piece) {
        container.utilities.store.set(name, piece)
      },
    }

    container.utilities = {
      ...container.utilities,
      actionStore: new ActionStoreUtility(FakerGenerator.generatePiece()),
      embedPresets: new EmbedPresetsUtility(FakerGenerator.generatePiece(), {}),
      pagination: new PaginationUtility(FakerGenerator.generatePiece(), {}),
      exposePiece: container.utilities.exposePiece.bind(container.utilities),
    }

    Mocker.createDatabaseInMemory()
  }

  static async resetSapphireClientInstance() {
    await container.client.destroy()

    container.db.close()
    Mocker.createDatabaseInMemory()
  }

  static createCommandInstance<T extends Command>(CommandClass: new (...args: any[]) => T): T {
    return new CommandClass(
      {
        name: faker.word.adjective(),
        path: faker.system.filePath(),
        root: faker.system.directoryPath(),
        store: container?.utilities?.store ?? {},
      },
      {},
    )
  }

  static createErrorHandler() {
    const errorHandler = mock()
    container.client.on(Events.ChatInputCommandError, errorHandler)
    container.client.on(SubcommandPluginEvents.ChatInputSubcommandError, errorHandler)

    return errorHandler
  }
  static mockApiRequest(mockedEndpointMethod: string, implementation: () => Promise<any>) {
    mock.module(path.resolve(process.cwd(), "src", "lib", "types", "api"), () => ({
      [mockedEndpointMethod]: implementation,
    }))
  }

  private static createDatabaseInMemory() {
    if (!container) throw new Error("Container is not initialized")

    container.db = new Database(":memory:")
    migrate(container.db, getMigrations(path.resolve(process.cwd(), "data", "migrations")))
  }
}
