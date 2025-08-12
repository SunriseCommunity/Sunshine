import { faker } from "@faker-js/faker"
import {
  CommandStore,
  container,
  InteractionHandlerStore,
  InteractionHandlerTypes,
} from "@sapphire/framework"
import { expect, describe, it, beforeAll, afterAll, jest, mock } from "bun:test"
import type { OsuCommand } from "../../../../commands/osu.command"
import { ExtendedError } from "../../../../lib/extended-error"
import { FakerGenerator } from "../../../../lib/mock/faker.generator"
import { Mocker } from "../../../../lib/mock/mocker"
import { PaginationSetPageModal } from "../pagination-set-page.model"
import type { PaginationStore } from "../../../../lib/types/store.types"
import { PaginationInteractionCustomId } from "../../../../lib/types/enum/custom-ids.types"

describe("Pagination Set Page Modal", () => {
  const modal = new PaginationSetPageModal(
    { ...FakerGenerator.generateLoaderContext(), store: new InteractionHandlerStore() },
    { interactionHandlerType: InteractionHandlerTypes.ModalSubmit },
  )

  let errorHandler: jest.Mock

  beforeAll(() => {
    Mocker.createSapphireClientInstance()
    // osuCommand = Mocker.createCommandInstance(OsuCommand)
    errorHandler = Mocker.createErrorHandler()
  })

  afterAll(async () => {
    await Mocker.resetSapphireClientInstance()
  })

  describe("parse", async () => {
    it("invalid interaction id provided", async () => {
      const modal = new PaginationSetPageModal(
        { ...FakerGenerator.generateLoaderContext(), store: new InteractionHandlerStore() },
        { interactionHandlerType: InteractionHandlerTypes.ModalSubmit },
      )

      const interaction = FakerGenerator.generateModalSubmitInteraction({
        customId: "invalid_custom_id",
      })

      const result = await modal.parse(interaction)

      expect(result).toBe(modal.none())
    })

    it("invalid interaction id provided", async () => {
      const modal = new PaginationSetPageModal(
        { ...FakerGenerator.generateLoaderContext(), store: new InteractionHandlerStore() },
        { interactionHandlerType: InteractionHandlerTypes.ModalSubmit },
      )

      const customId = FakerGenerator.generateCustomId()

      const interaction = FakerGenerator.generateModalSubmitInteraction({
        customId: customId,
      })

      const result = await modal.parse(interaction)

      expect(result).toBe(modal.none())
    })

    it("valid interaction id provided", async () => {
      const modal = new PaginationSetPageModal(
        { ...FakerGenerator.generateLoaderContext(), store: new InteractionHandlerStore() },
        { interactionHandlerType: InteractionHandlerTypes.ModalSubmit },
      )

      const dataStoreId = container.utilities.actionStore.set(mock())

      console.log(dataStoreId)

      const userId = faker.number.int().toString()

      const customId = FakerGenerator.generateCustomId({
        prefix: PaginationInteractionCustomId.PAGINATION_ACTION_SELECT_PAGE,
        userId,
        ctx: { dataStoreId: dataStoreId },
      })

      const interaction = FakerGenerator.generateModalSubmitInteraction({
        user: {
          id: userId,
        },
        customId: customId,
      })

      const result = await modal.parse(interaction)

      expect(result).not.toBe(modal.none())
    })
  })

  // TODO: Implement tests for run method
})
