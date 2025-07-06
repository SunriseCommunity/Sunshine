import { getUserSearch } from "../../lib/types/api"
import { bold, type SlashCommandSubcommandBuilder } from "discord.js"
import type { OsuCommand } from "../../commands/osu.command"
import type { Subcommand } from "@sapphire/plugin-subcommands"

export function addLinkSubcommand(command: SlashCommandSubcommandBuilder) {
  return command
    .setName("link")
    .setDescription("Link your osu!sunrise profile")
    .addStringOption((o) =>
      o.setName("username").setDescription("Your username on the server").setRequired(true),
    )
}

export async function chatInputRunLinkSubcommand(
  this: OsuCommand,
  interaction: Subcommand.ChatInputCommandInteraction,
) {
  await interaction.deferReply()

  const userUsernameOption = interaction.options.getString("username", true)

  const userSearchResponse = await getUserSearch({
    query: { limit: 1, page: 1, query: userUsernameOption },
  })

  if (userSearchResponse.error || userSearchResponse.data.length <= 0) {
    await interaction.editReply(
      userSearchResponse.error ? userSearchResponse.error.error : "Couldn't fetch user!",
    )
    return
  }

  const user = userSearchResponse.data[0]!

  const { db } = this.container

  const insertConnection = db.prepare(
    "INSERT OR REPLACE INTO connections (discord_user_id, osu_user_id) VALUES ($1, $2);",
  )

  insertConnection.run({
    $1: interaction.user.id,
    $2: user.user_id,
  })

  const { embedPresets } = this.container.utilities

  return await interaction.editReply({
    embeds: [embedPresets.getSuccessEmbed(`🙂 You are now ${bold(user.username)}!`)],
  })
}
