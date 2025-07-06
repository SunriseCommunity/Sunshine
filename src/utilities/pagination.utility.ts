import { ApplyOptions } from "@sapphire/decorators"
import { Utility } from "@sapphire/plugin-utilities-store"

import {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js"
import { PaginationButton } from "../lib/types/pagination.types"

@ApplyOptions<Utility.Options>({ name: "pagination" })
export class PaginationUtility extends Utility {
  private readonly buttonMaxLeft = new ButtonBuilder()
    .setCustomId(PaginationButton.MAX_LEFT)
    .setLabel("⏮️")
    .setStyle(ButtonStyle.Primary)

  private readonly buttonLeft = new ButtonBuilder()
    .setCustomId(PaginationButton.LEFT)
    .setLabel("⬅️")
    .setStyle(ButtonStyle.Primary)

  private readonly buttonSelectPage = new ButtonBuilder()
    .setCustomId(PaginationButton.SELECT_PAGE)
    .setLabel("*️⃣")
    .setStyle(ButtonStyle.Primary)

  private readonly buttonRight = new ButtonBuilder()
    .setCustomId(PaginationButton.RIGHT)
    .setLabel("➡️")
    .setStyle(ButtonStyle.Primary)

  private readonly buttonMaxRight = new ButtonBuilder()
    .setCustomId(PaginationButton.MAX_RIGHT)
    .setLabel("⏭️")
    .setStyle(ButtonStyle.Primary)

  public async createPaginationCollector(
    interaction: ChatInputCommandInteraction,
    handleSetPage: (state: {
      pageSize: number
      totalPages: number
      currentPage: number
    }) => Promise<EmbedBuilder>,
    initState?: {
      pageSize?: number
      totalPages?: number
      currentPage?: number
    },
  ) {
    const state = {
      pageSize: initState?.pageSize ?? 1,
      currentPage: initState?.currentPage ?? 1,
      totalPages: initState?.totalPages ?? 1,
    }

    const updatedEmbed = await handleSetPage(state)
    const buttonsRow = this.getPaginationButtonsRow(state)

    const message = await interaction.editReply({
      embeds: [updatedEmbed],
      components: [buttonsRow],
    })

    const { embedPresets } = this.container.utilities

    message.createMessageComponentCollector().on("collect", async (reply) => {
      await reply.deferUpdate()

      switch (reply.customId) {
        case PaginationButton.MAX_LEFT:
          state.currentPage = 1
          break
        case PaginationButton.LEFT:
          state.currentPage--
          break
        case PaginationButton.SELECT_PAGE:
          // TODO!
          break
        case PaginationButton.RIGHT:
          state.currentPage++
          break
        case PaginationButton.MAX_RIGHT:
          state.currentPage = state.totalPages
          break
        default:
          throw new Error("Unexpected customId for pagination")
      }

      await reply.editReply({
        embeds: [embedPresets.getSuccessEmbed("⌛ Please wait...")],
        components: [],
      })

      const updatedEmbed = await handleSetPage(state)
      const buttonsRow = this.getPaginationButtonsRow(state)

      await reply.editReply({
        embeds: [updatedEmbed],
        components: [buttonsRow],
      })
    })
  }

  private getPaginationButtonsRow(options: {
    pageSize: number
    currentPage: number
    totalPages: number
  }) {
    const buttonsRow = new ActionRowBuilder<ButtonBuilder>()

    const { currentPage, totalPages } = options

    const isOnFirstPage = currentPage <= 1
    const isOnLastPage = currentPage >= totalPages

    buttonsRow.setComponents(
      ButtonBuilder.from(this.buttonMaxLeft.toJSON()).setDisabled(isOnFirstPage),
      ButtonBuilder.from(this.buttonLeft.toJSON()).setDisabled(isOnFirstPage),
      ButtonBuilder.from(this.buttonSelectPage.toJSON()).setDisabled(isOnFirstPage && isOnLastPage),
    )

    buttonsRow.addComponents(
      ButtonBuilder.from(this.buttonRight.toJSON()).setDisabled(isOnLastPage),
      ButtonBuilder.from(this.buttonMaxRight.toJSON()).setDisabled(isOnLastPage),
    )

    return buttonsRow
  }
}
