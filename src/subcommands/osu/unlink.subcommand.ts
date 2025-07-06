import { type SlashCommandSubcommandBuilder } from "discord.js"
import type { OsuCommand } from "../../commands/osu.command"
import type { Subcommand } from "@sapphire/plugin-subcommands"

export function addUnlinkSubcommand(command: SlashCommandSubcommandBuilder) {
  return command.setName("unlink").setDescription("Unlink your osu!sunrise profile")
}

export async function chatInputRunUnlinkSubcommand(
  this: OsuCommand,
  interaction: Subcommand.ChatInputCommandInteraction,
) {
  await interaction.deferReply()

  const { db } = this.container

  var row = db.query("SELECT count(*) FROM connections WHERE discord_user_id = $1").get({
    $1: interaction.user.id,
  }) as { "count(*)": number }

  const { embedPresets } = this.container.utilities

  if (!row || row["count(*)"] === 0) {
    return await interaction.editReply({
      embeds: [embedPresets.getErrorEmbed(`❓ You don't have any linked account`)],
    })
  }

  const deleteConnection = db.prepare("DELETE FROM connections WHERE discord_user_id = $1")

  deleteConnection.run({
    $1: interaction.user.id,
  })

  return await interaction.editReply({
    embeds: [embedPresets.getSuccessEmbed(`I successfully unlinked your account!`)],
  })
}
