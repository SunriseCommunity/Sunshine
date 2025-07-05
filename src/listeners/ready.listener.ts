import { ApplyOptions } from "@sapphire/decorators"
import { Events, Listener } from "@sapphire/framework"
import type { Client } from "discord.js"

@ApplyOptions<Listener.Options>({ event: Events.ClientReady, once: true })
export class ReadyListener extends Listener {
  public run(client: Client) {
    const { username, id } = client.user!

    this.container.logger.info(`⛅ Successfully logged in as ${username} (${id})`)
  }
}
