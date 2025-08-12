import { expect, describe, it, beforeAll, afterAll, jest, mock } from "bun:test"
import { container } from "@sapphire/framework"
import { OsuCommand } from "../../../commands/osu.command"
import { Mocker } from "../../../lib/mock/mocker"
import { FakerGenerator } from "../../../lib/mock/faker.generator"
import { faker } from "@faker-js/faker"
import { ExtendedError } from "../../../lib/extended-error"

describe("Osu Link Subcommand", () => {
  let osuCommand: OsuCommand
  let errorHandler: jest.Mock

  beforeAll(() => {
    Mocker.createSapphireClientInstance()
    osuCommand = Mocker.createCommandInstance(OsuCommand)
    errorHandler = Mocker.createErrorHandler()
  })

  afterAll(async () => {
    await Mocker.resetSapphireClientInstance()
  })

  it("should reply with success message when link is successful", async () => {
    const editReplyMock = mock()
    const username = faker.internet.username()

    const interaction = FakerGenerator.withSubcommand(
      FakerGenerator.generateInteraction({
        deferReply: mock(),
        editReply: editReplyMock,
        options: {
          getString: jest.fn().mockReturnValue(username),
        },
      }),
      "link",
    )

    const osuUserId = faker.number.int({ min: 1, max: 1000000 })

    Mocker.mockApiRequest("getUserSearch", async () => ({
      data: [{ user_id: osuUserId, username: username }],
    }))

    await osuCommand.chatInputRun(interaction, {
      commandId: faker.string.uuid(),
      commandName: "link",
    })

    const expectedEmbed = container.utilities.embedPresets.getSuccessEmbed(
      `🙂 You are now **${username}**!`,
    )

    expect(errorHandler).not.toBeCalled()

    expect(editReplyMock).toHaveBeenLastCalledWith({
      embeds: [
        expect.objectContaining({
          data: expect.objectContaining({
            title: expectedEmbed.data.title,
          }),
        }),
      ],
    })

    const { db } = container

    const row = db.query("SELECT osu_user_id FROM connections WHERE discord_user_id = $1").get({
      $1: interaction.user.id,
    })

    expect(row).toEqual({ osu_user_id: osuUserId.toString() })
  })

  it("should reply with error message when link fails", async () => {
    const username = faker.internet.username()

    const interaction = FakerGenerator.withSubcommand(
      FakerGenerator.generateInteraction({
        deferReply: mock(),
        editReply: mock(),
        options: {
          getString: jest.fn().mockReturnValue(username),
        },
      }),
      "link",
    )

    Mocker.mockApiRequest("getUserSearch", async () => ({
      error: "User not found",
    }))

    await osuCommand.chatInputRun(interaction, {
      commandId: faker.string.uuid(),
      commandName: "link",
    })

    expect(errorHandler).toHaveBeenCalledWith(expect.any(ExtendedError), expect.anything())

    const { db } = container

    const row = db.query("SELECT osu_user_id FROM connections WHERE discord_user_id = $1").get({
      $1: interaction.user.id,
    })

    expect(row).toBeNull()
  })
})
