import { SlashCommandBuilder } from "@discordjs/builders"
import { Client, CommandInteraction } from "discord.js"
import { createDocument } from "../firebase"

export const data = new SlashCommandBuilder()
  .setName("test")
  .setDescription("test")
  .addStringOption(option => {
    return option
      .setName("text")
      .setDescription("aaaa")
      .setRequired(true)
  })

export async function execute(interaction: CommandInteraction) {
  await createDocument(interaction.user.id, interaction.options.getString("text")!)
  await interaction.followUp({ content: "ok", ephemeral: true })
}