import { CommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js"

export interface Command extends ChatInputApplicationCommandData {
  execute: (interaction: CommandInteraction, client: Client) => void
}