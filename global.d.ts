import Database from "bun:sqlite"
import type { IConfig } from "./src/lib/configs/env"
import type { EmbedPresetsUtility } from "./src/utilities/embed-presets.utility"
import type { PaginationUtility } from "./src/utilities/pagination.utility"

declare module "@sapphire/pieces" {
  interface Container {
    config: IConfig
    sunrise: {
      websocket: WebSocket
    }
    db: Database
  }
}

declare module "@sapphire/plugin-utilities-store" {
  interface Utilities {
    embedPresets: EmbedPresetsUtility
    pagination: PaginationUtility
  }
}

declare module "discord.js" {
  interface Client {
    guild?: Guild
  }
}
