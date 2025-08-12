import { expect, describe, it, mock, jest, beforeAll, afterAll } from "bun:test"
import { MeowCommand } from "../meow.command"
import { Mocker } from "../../lib/mock/mocker"
import { FakerGenerator } from "../../lib/mock/faker.generator"

describe("Meow Command", () => {
  let meowCommand: MeowCommand
  let errorHandler: jest.Mock

  beforeAll(() => {
    Mocker.createSapphireClientInstance()
    meowCommand = Mocker.createCommandInstance(MeowCommand)
    errorHandler = Mocker.createErrorHandler()
  })

  afterAll(async () => {
    await Mocker.resetSapphireClientInstance()
  })

  it("should reply with 'meow! 😺' when chatInputRun is called", async () => {
    const replyMock = mock()
    const interaction = FakerGenerator.generateInteraction({
      reply: replyMock,
    })

    await meowCommand.chatInputRun(interaction)

    expect(errorHandler).not.toBeCalled()

    expect(replyMock).toHaveBeenCalledWith("meow! 😺")
  })
})
