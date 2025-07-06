import { ApplyOptions } from "@sapphire/decorators"
import { Listener } from "@sapphire/framework"
import {
  SubcommandPluginEvents,
  type ChatInputCommandSubcommandMappingMethod,
  type ChatInputSubcommandSuccessPayload,
} from "@sapphire/plugin-subcommands"
import { logCommand } from "../../lib/utils/command-logger.util"
import type { Interaction } from "discord.js"

@ApplyOptions<Listener.Options>({
  name: SubcommandPluginEvents.ChatInputSubcommandSuccess,
})
export class ChatInputSubcommandSuccessListener extends Listener {
  public override run(
    _interaction: Interaction,
    subcommand: ChatInputCommandSubcommandMappingMethod,
    payload: ChatInputSubcommandSuccessPayload,
  ) {
    logCommand(payload, subcommand)
  }
}
