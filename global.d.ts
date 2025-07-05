import type { IConfig } from "./src/lib/configs/env";
import type { EmbedPresetsUtility } from "./src/utilities/embed-presets.utility";

declare module "@sapphire/pieces" {
  interface Container {
    config: IConfig;
    sunrise: {
      websocket: WebSocket;
    };
  }
}

declare module "@sapphire/plugin-utilities-store" {
  interface Utilities {
    embedPresets: EmbedPresetsUtility;
  }
}

declare module "discord.js" {
  interface Client {
    guild?: Guild;
  }
}
