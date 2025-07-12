import {
  GameMode,
  getBeatmapById,
  getScoreById,
  getUserByIdScores,
  getUserSearch,
  ScoreTableType,
} from "../../lib/types/api"
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type SlashCommandSubcommandBuilder,
} from "discord.js"
import type { OsuCommand } from "../../commands/osu.command"
import type { Subcommand } from "@sapphire/plugin-subcommands"
import { ExtendedError } from "../../lib/extended-error"

export function addRecentScoreSubcommand(command: SlashCommandSubcommandBuilder) {
  return command
    .setName("rs")
    .setDescription("Check users recent score")
    .addStringOption((o) =>
      o.setName("username").setDescription("User's username").setRequired(false),
    )
    .addUserOption((o) =>
      o.setName("discord").setDescription("Show users profile if he linked any").setRequired(false),
    )
    .addStringOption((o) =>
      o
        .setName("gamemode")
        .setDescription("Select gamemode")
        .setRequired(false)
        .setChoices(
          Object.values(GameMode).map((mode) => ({
            name: mode.toString(),
            value: mode.toString(),
          })),
        ),
    )
}

export async function chatInputRunRecentScoreSubcommand(
  this: OsuCommand,
  interaction: Subcommand.ChatInputCommandInteraction,
) {
  await interaction.deferReply()

  const userUsernameOption = interaction.options.getString("username")
  const userDiscordOption = interaction.options.getUser("discord")

  const gamemodeOption = interaction.options.getString("gamemode") as GameMode | null

  let recentScoreResponse = null

  const { embedPresets } = this.container.utilities

  if (userUsernameOption) {
    const userSearchResponse = await getUserSearch({
      query: { limit: 1, page: 1, query: userUsernameOption },
    })

    if (userSearchResponse.error || userSearchResponse.data.length <= 0) {
      throw new ExtendedError(
        userSearchResponse.error
          ? userSearchResponse.error.error
          : "❓ I couldn't find user with such username",
      )
    }

    recentScoreResponse = await getUserByIdScores({
      path: {
        id: userSearchResponse.data[0]!.user_id,
      },
      query: {
        mode: gamemodeOption ?? GameMode.STANDARD,
        type: ScoreTableType.RECENT,
        page: 1,
        limit: 1,
      },
    })
  }

  if (recentScoreResponse == null) {
    const { db } = this.container

    const row = db.query("SELECT osu_user_id FROM connections WHERE discord_user_id = $1").get({
      $1: userDiscordOption ? userDiscordOption.id : interaction.user.id,
    }) as null | { osu_user_id: number }

    if (!row || !row.osu_user_id) {
      throw new ExtendedError(`❓ Provided user didn't link their osu!sunrise account`)
    }

    recentScoreResponse = await getUserByIdScores({
      path: {
        id: row.osu_user_id,
      },
      query: {
        mode: gamemodeOption ?? GameMode.STANDARD,
        type: ScoreTableType.RECENT,
        page: 1,
        limit: 1,
      },
    })
  }

  if (!recentScoreResponse || recentScoreResponse.error) {
    throw new ExtendedError(
      recentScoreResponse?.error
        ? recentScoreResponse.error.error
        : "Couldn't fetch requested user's recent score!",
    )
  }

  if (recentScoreResponse.data.scores.length <= 0) {
    throw new ExtendedError("This user has no recent scores")
  }

  const score = recentScoreResponse.data.scores[0]!

  const beatmap = await getBeatmapById({
    path: {
      id: score.beatmap_id,
    },
  })

  if (!beatmap || beatmap.error) {
    this.container.client.logger.error(
      `RecentScoreSubcommand: Couldn't fetch score's (id: ${score.id}) beatmap (id: ${score.beatmap_id}).`,
    )
    throw new ExtendedError(`❓ I couldn't fetch score's beatmap data`)
  }

  const scoreEmbed = await embedPresets.getScoreEmbed(score, beatmap.data)

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setURL(`https://${this.container.config.sunrise.uri}/score/${score.id}`)
      .setLabel("View score online")
      .setStyle(ButtonStyle.Link),
  )

  await interaction.editReply({
    embeds: [scoreEmbed],
    components: [buttons],
  })
}
