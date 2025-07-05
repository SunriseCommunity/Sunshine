import { GameMode, getUserByIdByMode, getUserSearch } from "../../lib/types/api"
import type { SlashCommandSubcommandBuilder } from "discord.js"
import type { OsuCommand } from "../../commands/osu.command"
import type { Subcommand } from "@sapphire/plugin-subcommands"

export function addProfileSubcommand(command: SlashCommandSubcommandBuilder) {
  return command
    .setName("profile")
    .setDescription("Check user's profile")
    .addStringOption((o) => o.setName("username").setDescription("User's username"))
    .addUserOption((o) =>
      o.setName("discord").setDescription("Show users profile if he linked any"),
    )
    .addNumberOption((option) => option.setName("id").setDescription("User's id"))
    .addStringOption((option) =>
      option
        .setName("gamemode")
        .setDescription("Select gamemode")
        .setChoices(
          Object.values(GameMode).map((mode) => ({
            name: mode.toString(),
            value: mode.toString(),
          })),
        ),
    )
}

export async function chatInputRunProfileSubcommand(
  this: OsuCommand,
  interaction: Subcommand.ChatInputCommandInteraction,
) {
  await interaction.deferReply()

  let userIdOption = interaction.options.getNumber("id")
  const userUsernameOption = interaction.options.getString("username")
  const userDiscordOption = interaction.options.getUser("discord")

  const gamemodeOption = interaction.options.getString("gamemode") as GameMode | null

  let userResponse = null

  if (userUsernameOption) {
    const userSearchResponse = await getUserSearch({
      query: { limit: 1, page: 1, query: userUsernameOption },
    })

    if (userSearchResponse.error || userSearchResponse.data.length < 0) {
      await interaction.editReply(
        userSearchResponse.error ? userSearchResponse.error.error : "Couldn't fetch user!",
      )
      return
    }

    userIdOption = userSearchResponse.data[0]?.user_id ?? null
  }

  if (userIdOption && userResponse == null) {
    userResponse = await getUserByIdByMode({
      path: { id: userIdOption, mode: gamemodeOption ?? GameMode.STANDARD },
    })
  }

  if (userDiscordOption && userResponse == null) {
    // TODO: also try to fetch yourself if no userDiscordOption is provided;
    throw new Error("TODO")
  }

  if (!userResponse || userResponse.error) {
    await interaction.editReply(
      userResponse?.error ? userResponse.error.error : "Couldn't fetch user!",
    )
    return
  }

  const { embedPresets } = this.container.utilities
  const { user, stats } = userResponse.data

  const userEmbed = await embedPresets.getUserEmbed(user, stats!)

  await interaction.editReply({ embeds: [userEmbed] })
}
