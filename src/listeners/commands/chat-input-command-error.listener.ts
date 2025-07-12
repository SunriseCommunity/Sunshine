import { ApplyOptions } from "@sapphire/decorators"
import { Events, type ChatInputCommandErrorPayload } from "@sapphire/framework"
import { Listener } from "@sapphire/framework"
import { Subcommand } from "@sapphire/plugin-subcommands"
import { logCommand } from "../../lib/utils/command-logger.util"
import { ExtendedError } from "../../lib/extended-error"
import { interactionError } from "../../lib/utils/interaction.util"

@ApplyOptions<Listener.Options>({
  name: Events.ChatInputCommandError,
})
export class ChatInputCommandErrorListener extends Listener {
  public override run(error: Error, payload: ChatInputCommandErrorPayload) {
    if (payload.command instanceof Subcommand) return

    logCommand(payload)

    if (error instanceof ExtendedError) {
      const { embedPresets } = this.container.utilities
      interactionError(embedPresets, payload.interaction, error.message)
    } else {
      this.container.logger.error(error)
    }
  }
}
