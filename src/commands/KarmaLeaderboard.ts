import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import { getTopKarma } from "../firebase/karmaDb"
import { Command } from "../interfaces"
import { emojis } from "../data/karma.json"
import { client } from "../bot"

const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Users with the most karma")

async function execute(interaction: CommandInteraction) {
  const topUsers = await getTopKarma()
  const upvote = client.emojis.resolve(emojis.upvote) ?? emojis.upvote
  const downvote = client.emojis.resolve(emojis.downvote) ?? emojis.downvote

  const embed = new MessageEmbed()
    .setColor("FUCHSIA")
    .setTitle("Karma Leaderboard")
    .setDescription(
      `You can react to other people's messages with ${upvote} or ${downvote} to affect their karma score.` +
        "\n\u200b",
    )
    .setFooter({ text: "You cannot affect vote on your own messages." })

  let rank = 0
  topUsers.forEach(({ id, karma }) => {
    rank++
    embed.addField(
      getRankStr(rank, interaction.user.id === id),
      `<@${id}>\n\n${karma > 0 ? upvote : downvote} ${karma}\n\u200b`,
      true,
    )

    // space the first 3 entries from the others as a podium
    if (rank === 3) embed.addField("\u200b", "\u200b")
  })

  interaction.followUp({ embeds: [embed] })
}

function getRankStr(rank: number, isAuthor: boolean) {
  switch (rank) {
    case 1:
      return ":first_place: First Place"
    case 2:
      return ":second_place: Second Place"
    case 3:
      return ":third_place: Third Place"
    default:
      if (isAuthor) return `:star: #${rank.toString().padStart(2, "0")}`
      else return `#${rank.toString().padStart(2, "0")}`
  }
}

export const KarmaLeaderboard = { data, execute } as Command
