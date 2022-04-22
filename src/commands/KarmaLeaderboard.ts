import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getTopKarma } from "../firebase/karmaDb"
import { Command } from "../interfaces"

const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Users with the most karma")

async function execute(interaction: CommandInteraction) {
  const topUsers = await getTopKarma()

  await interaction.followUp({ content: "```json\n" + JSON.stringify(topUsers, null, 2) + "```" })
}

export const KarmaLeaderboard = { data, execute } as Command
