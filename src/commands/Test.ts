import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { Command } from "src/interfaces"
import { createDocument } from "../firebase"

const data = new SlashCommandBuilder()
  .setName("test")
  .setDescription("test")
  .addStringOption(option => {
    return option
      .setName("text")
      .setDescription("aaaa")
      .setRequired(true)
  })

async function execute(interaction: CommandInteraction) {
  await createDocument(interaction.user.id, interaction.options.getString("text")!)
  await interaction.followUp({ content: "ok", ephemeral: true })
}

export const Test = { data, execute } as Command