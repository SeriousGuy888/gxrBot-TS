import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("pang")

export async function execute(interaction: CommandInteraction) {
  interaction.reply("pong")
}