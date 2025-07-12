import type { AnyInteraction } from "@sapphire/discord.js-utilities"
import { AutocompleteInteraction, Colors, EmbedBuilder } from "discord.js"

export function interactionError(
  interaction: Exclude<AnyInteraction, AutocompleteInteraction>,
  message: string,
) {
  const payload = {
    embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(message)],
    ephemeral: true,
  }

  return interaction.deferred || interaction.replied
    ? interaction.followUp(payload)
    : interaction.reply(payload)
}
