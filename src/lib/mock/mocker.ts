import { mock } from "bun:test"
import { Database } from "bun:sqlite"
import { getMigrations, migrate } from "bun-sqlite-migrations"
import path from "path"

import { IntentsBitField } from "discord.js"
import { SapphireClient, LogLevel, container, Command, Events } from "@sapphire/framework"
import { SubcommandPluginEvents } from "@sapphire/plugin-subcommands"
import { UtilitiesStore } from "@sapphire/plugin-utilities-store"
import { faker } from "@faker-js/faker"

import { ActionStoreUtility } from "../../utilities/action-store.utility"
import { EmbedPresetsUtility } from "../../utilities/embed-presets.utility"
import { PaginationUtility } from "../../utilities/pagination.utility"
import { FakerGenerator } from "./faker.generator"

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
      has: mock((level: LogLevel) => level === LogLevel.Debug),
    }

    const store = new UtilitiesStore()
    container.utilities = {
      ...container.utilities,
      store,
      actionStore: new ActionStoreUtility(FakerGenerator.generatePiece()),
      embedPresets: new EmbedPresetsUtility(FakerGenerator.generatePiece(), {}),
      pagination: new PaginationUtility(FakerGenerator.generatePiece(), {}),
      exposePiece(name, piece) {
        store.set(name, piece)
      },
    }

    this.createDatabaseInMemory()
  }

  static async resetSapphireClientInstance() {
    await container.client.destroy()
    container.db.close()
    this.createDatabaseInMemory()
  }

  static createCommandInstance<T extends Command>(CommandClass: new (...args: any[]) => T): T {
    return new CommandClass(
      {
        name: faker.word.adjective(),
        path: faker.system.filePath(),
        root: faker.system.directoryPath(),
        store: container.utilities.store,
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
    if (!container) {
      throw new Error("Container is not initialized")
    }
    container.db = new Database(":memory:")
    migrate(container.db, getMigrations(path.resolve(process.cwd(), "data", "migrations")))
  }
}
