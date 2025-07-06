import { cyan } from "colorette"
import { container } from "@sapphire/pieces"
import type { APIUser, Guild, User } from "discord.js"
import type {
  ChatInputCommandSubcommandMappingMethod,
  ChatInputSubcommandErrorPayload,
  ChatInputSubcommandSuccessPayload,
  Subcommand,
} from "@sapphire/plugin-subcommands"
import type {
  ChatInputCommandSuccessPayload,
  ChatInputCommandErrorPayload,
  ChatInputCommand,
} from "@sapphire/framework"

function getShardInfo(id: number) {
  return `[${cyan(id.toString())}]`
}

function getCommandInfo(command: ChatInputCommand | Subcommand) {
  return cyan(command.name)
}

function getAuthorInfo(author: User | APIUser) {
  return `${author.username} (${cyan(author.id)})`
}

export function logCommand(
  payload:
    | ChatInputCommandSuccessPayload
    | ChatInputCommandErrorPayload
    | ChatInputSubcommandSuccessPayload
    | ChatInputSubcommandErrorPayload,
  subcommand?: ChatInputCommandSubcommandMappingMethod | string,
): void {
  let data: ReturnType<typeof getLoggerData>

  let subcommandLog = ""

  if (subcommand) {
    if (typeof subcommand === "string") {
      subcommandLog = ` ${cyan(subcommand)}`
    } else {
      subcommandLog = ` ${cyan(subcommand.name)}`
    }
  }

  data = getLoggerData(payload.interaction.guild, payload.interaction.user, payload.command)
  container.logger.info(
    `User ${data.author} used /${data.commandName.replace(".command", "")}${subcommandLog}`,
  )
}

function getLoggerData(guild: Guild | null, user: User, command: ChatInputCommand | Subcommand) {
  const shard = getShardInfo(guild?.shardId ?? 0)
  const commandName = getCommandInfo(command)
  const author = getAuthorInfo(user)

  return {
    shard,
    commandName,
    author,
  }
}
