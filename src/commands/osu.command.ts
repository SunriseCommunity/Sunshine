import { Command } from "@sapphire/framework"
import { Subcommand } from "@sapphire/plugin-subcommands"
import {
  addProfileSubcommand,
  chatInputRunProfileSubcommand,
} from "../subcommands/osu/profile.subcommand"
import { ApplyOptions } from "@sapphire/decorators"
import {
  addScoreSubcommand,
  chatInputRunScoreSubcommand,
} from "../subcommands/osu/score.subcommand"

const COMMANDS = ["profile", "score"]

@ApplyOptions<Subcommand.Options>({
  subcommands: [
    ...COMMANDS.map((cmd) => ({
      name: cmd,
      chatInputRun: cmd.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()),
    })),
  ],
})
export class OsuCommand extends Subcommand {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("osu")
        .setDescription("Server's commands")
        .addSubcommand(addProfileSubcommand)
        .addSubcommand(addScoreSubcommand),
    )
  }

  public profile = async (interaction: Subcommand.ChatInputCommandInteraction) =>
    chatInputRunProfileSubcommand.call(this, interaction)

  public score = async (interaction: Subcommand.ChatInputCommandInteraction) =>
    chatInputRunScoreSubcommand.call(this, interaction)
}
