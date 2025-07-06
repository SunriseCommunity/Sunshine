import { ApplyOptions } from "@sapphire/decorators"
import { Listener } from "@sapphire/framework"
import {
  SubcommandPluginEvents,
  type ChatInputSubcommandErrorPayload,
} from "@sapphire/plugin-subcommands"
import { logCommand } from "../../lib/utils/command-logger.util"

@ApplyOptions<Listener.Options>({
  name: SubcommandPluginEvents.ChatInputSubcommandError,
})
export class ChatInputSubcommandErrorListener extends Listener {
  public override run(error: Error, payload: ChatInputSubcommandErrorPayload) {
    logCommand(payload, payload.matchedSubcommandMapping.name)
    this.container.logger.error(error)
  }
}
