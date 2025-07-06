import { getBeatmapById, getScoreById } from "../../lib/types/api"
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type SlashCommandSubcommandBuilder,
} from "discord.js"
import type { OsuCommand } from "../../commands/osu.command"
import type { Subcommand } from "@sapphire/plugin-subcommands"

export function addScoreSubcommand(command: SlashCommandSubcommandBuilder) {
  return command
    .setName("score")
    .setDescription("Get score data")
    .addStringOption((o) =>
      o.setName("score").setDescription("Score id or link").setRequired(false),
    )
}

export async function chatInputRunScoreSubcommand(
  this: OsuCommand,
  interaction: Subcommand.ChatInputCommandInteraction,
) {
  await interaction.deferReply()

  const scoreStringOption = interaction.options.getString("score")
  let scoreId = -1

  if (scoreStringOption?.includes(this.container.config.sunrise.uri)) {
    scoreId = Number(scoreStringOption.split("/").pop() ?? -1)
  } else {
    scoreId = Number(scoreStringOption ?? -1)
  }

  const { embedPresets } = this.container.utilities

  if (scoreId == -1) {
    return await interaction.editReply({
      embeds: [embedPresets.getErrorEmbed(`❓ Bad score id/link is provided`)],
    })
  }

  const scoreResponse = await getScoreById({
    path: {
      id: scoreId,
    },
  })

  if (scoreResponse.error) {
    return await interaction.editReply({
      embeds: [embedPresets.getErrorEmbed(`❓ I couldn't find score with such data`)],
    })
  }

  const score = scoreResponse.data

  const beatmap = await getBeatmapById({
    path: {
      id: score.beatmap_id,
    },
  })

  if (!beatmap || beatmap.error) {
    this.container.client.logger.error(
      `ScoreSubcommand: Couldn't fetch score's (id: ${score.id}) beatmap (id: ${score.beatmap_id}).`,
    )
    return await interaction.editReply({
      embeds: [embedPresets.getErrorEmbed(`❓ I couldn't fetch score's beatmap data`)],
    })
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
