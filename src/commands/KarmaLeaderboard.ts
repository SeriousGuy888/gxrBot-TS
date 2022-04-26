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
  const topUsers = await getTopKarma(15)
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

  let rank = 1
  topUsers.forEach(({ id, karma }) => {
    const isAuthor = interaction.user.id === id

    const rankStr = getRankStr(rank, isAuthor)
    const mention = `<@${id}>`
    const emoji = karma > 0 ? upvote : downvote
    const karmaStr = isAuthor
      ? `[${karma}](https://www.youtube.com/watch?v=aB5Eqo9-gfU)` // make text blue if its the author
      : karma.toString()

    embed.addField(rankStr, `${mention}\n${emoji} ${karmaStr}\n\u200b`, true)

    // space the first 3 entries from the others as a podium
    if (rank === 3) embed.addField("\u200b", "\u200b")
    rank++
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
      if (isAuthor) return `:star: #${rank.toString()}`
      else return `#${rank.toString()}`
  }
}

export const KarmaLeaderboard = { data, execute } as Command
