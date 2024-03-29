import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import { getBirthdayEmbed } from "../util/birthdayReminder"
import { Command } from "../interfaces"

const data = new SlashCommandBuilder().setName("test").setDescription("test")

async function execute(interaction: CommandInteraction) {
  if (interaction.user.id !== "323170410818437130") {
    interaction.followUp("le non")
    return
  }

  const embed = getBirthdayEmbed(new Date())
  if (!embed) {
    interaction.followUp("Oeuf")
    return
  }
  await interaction.followUp({ embeds: [embed] })
}

export const Test = { data, execute } as Command
