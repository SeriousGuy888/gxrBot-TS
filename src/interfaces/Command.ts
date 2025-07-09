import { ChatInputCommandInteraction } from "discord.js"

export interface Command {
  data: unknown
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}
