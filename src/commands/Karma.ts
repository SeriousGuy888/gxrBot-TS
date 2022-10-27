import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js"
import { getKarma } from "../firebase/karmaDb"
import { Command } from "../interfaces"

const data = new SlashCommandBuilder()
  .setName("karma")
  .setDescription("Check how much karma a user has")
  .addUserOption((option) => {
    return option
      .setName("user")
      .setDescription("The user to check the karma of")
      .setRequired(false)
  })

async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser("user") ?? interaction.user

  const karma = await getKarma(user.id)
  const embed = new EmbedBuilder()
    .setColor(Colors.Fuchsia)
    .setTitle(`${user.tag}'s Karma`)
    .setDescription(`✨ ${karma}`)

  await interaction.followUp({ embeds: [embed] })
}

export const Karma = { data, execute } as Command
