import { CommandInteraction } from "discord.js"

export interface Command {
  data: unknown
  execute: (interaction: CommandInteraction) => void
}
