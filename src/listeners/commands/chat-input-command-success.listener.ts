import { ApplyOptions } from "@sapphire/decorators"
import { Events, type ChatInputCommandSuccessPayload } from "@sapphire/framework"
import { Listener } from "@sapphire/framework"
import { Subcommand } from "@sapphire/plugin-subcommands"
import { logCommand } from "../../lib/utils/command-logger.util"

@ApplyOptions<Listener.Options>({
  name: Events.ChatInputCommandSuccess,
})
export class ChatInputCommandSuccessListener extends Listener {
  public override run(payload: ChatInputCommandSuccessPayload) {
    if (payload.command instanceof Subcommand) return

    logCommand(payload)
  }
}
