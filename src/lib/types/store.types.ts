import type { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js"

export interface PaginationStore {
  handleSetPage: (state: { pageSize: number; totalPages: number; currentPage: number }) => Promise<{
    embed: EmbedBuilder
    buttonsRow: ActionRowBuilder<ButtonBuilder>
  }>
  state: {
    pageSize: number
    totalPages: number
    currentPage: number
  }
}
