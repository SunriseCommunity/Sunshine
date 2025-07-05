import {
  ApplicationCommandRegistries,
  LogLevel,
  RegisterBehavior,
  SapphireClient,
  container,
} from "@sapphire/framework"
import { Time } from "@sapphire/time-utilities"
import { GatewayIntentBits } from "discord.js"
import { config } from "./lib/configs/env"
import { CUSTOM_EVENTS } from "./lib/types/custom-events.types"
import { WebSocketEventType } from "./lib/types/websocket.types"
import { client as apiClient } from "./lib/types/api/client.gen"

export class SunshineClient extends SapphireClient {
  private websocketHeartbeatTimeout: NodeJS.Timeout | null = null
  private readonly serverApiURI = "api." + config.sunrise.uri

  public constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
      logger: { level: LogLevel.Debug },
      defaultCooldown: {
        delay: Time.Second * 2,
      },
      enableLoaderTraceLoggings: true,
      loadDefaultErrorListeners: false,
      loadMessageCommandListeners: true,
    })

    this.init()
    this.initWebsocket()
  }

  private init() {
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite)

    apiClient.setConfig({ baseUrl: "https://" + this.serverApiURI })

    container.config = config
  }

  private initWebsocket() {
    container.sunrise = {
      websocket: new WebSocket(`wss://${this.serverApiURI}/ws`),
    }

    container.sunrise.websocket.addEventListener("open", () => {
      container.logger.info("Server's Websocket: WebSocket connected!")

      this.websocketHeartbeatTimeout = setInterval(() => {
        if (container.sunrise.websocket.readyState === WebSocket.OPEN) {
          container.sunrise.websocket.send(JSON.stringify({ type: "ping" }))
          container.logger.debug(`Sent heartbeat for server's websocket`)
        }
      }, 30 * Time.Second)
    })

    container.sunrise.websocket.addEventListener("error", (e) => {
      container.logger.error(`Server's Websocket:`, e)
    })

    container.sunrise.websocket.addEventListener("close", () => {
      if (this.websocketHeartbeatTimeout) clearTimeout(this.websocketHeartbeatTimeout)

      container.logger.error(`Server's Websocket: Connection Closed. Trying to reconnect`)

      setTimeout(this.initWebsocket.bind(this), 5 * Time.Second)
    })

    container.sunrise.websocket.addEventListener("message", (evenet) => {
      const { data: dataRaw } = evenet

      const data = JSON.parse(dataRaw) as {
        type: WebSocketEventType | undefined
        data: any
      }

      if (data.type === undefined || !data.data) {
        return
      }

      const eventMap = {
        [WebSocketEventType.NewScoreSubmitted]: CUSTOM_EVENTS.NewScore,
        [WebSocketEventType.CustomBeatmapStatusChanged]: CUSTOM_EVENTS.CustomBeatmapStatusChange,
      }

      const eventName = eventMap[data.type]
      if (eventName) {
        container.client.ws.emit(eventName, data.data)
      }
    })
  }
}
