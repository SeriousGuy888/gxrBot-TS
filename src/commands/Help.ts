import { SlashCommandBuilder } from "@discordjs/builders"
import { Client, CommandInteraction } from "discord.js"

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("help")
  .addStringOption(option => {
    return option
      .setName("aaa")
      .setDescription("aaaa")
      .setRequired(true)
  })

export async function execute(interaction: CommandInteraction, client: Client) {
  interaction.reply("help")
}