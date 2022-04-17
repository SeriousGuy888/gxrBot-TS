import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { writeKarmaChanges } from "../firebase/karmaDb"
import { Command } from "../interfaces"

const data = new SlashCommandBuilder()
  .setName("test")
  .setDescription("test")
  .addUserOption((option) => {
    return option.setName("user").setDescription("user").setRequired(true)
  })

async function execute(interaction: CommandInteraction) {
  await writeKarmaChanges()
  await interaction.followUp({ content: "ok" })
}

export const Test = { data, execute } as Command
