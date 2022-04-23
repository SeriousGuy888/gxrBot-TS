import { Message, MessageReaction, User } from "discord.js"
import { addKarma } from "../firebase/karmaDb"
import { emojis, voteChannels } from "../data/karma.json"

export async function processReactionEvent(
  messageReaction: MessageReaction,
  user: User,
  changeMade: "add" | "remove",
) {
  if (messageReaction.partial) messageReaction = await messageReaction.fetch()

  // uses emoji id number if a custom emoji, uses literal string representation for unicode emojis
  const emojiId = messageReaction.emoji.id ?? messageReaction.emoji.toString()
  const messageAuthor = messageReaction.message.author

  if (!Object.values(emojis).includes(emojiId)) return
  if (!messageAuthor) return
  if (user.bot || messageAuthor.id === user.id) return

  let change = 1
  if (emojiId === emojis.downvote) change *= -1
  if (changeMade === "remove") change *= -1

  await addKarma(messageAuthor.id, change)
}

export async function addVoteReactions(message: Message) {
  const channel = message.channel
  if (!channel) return
  if (!voteChannels.includes(channel.id)) return

  // get emojis from the karma config and
  // loop through each of them to add them to the message's reactions
  // but catch if any of them fail with Promise.all()
  const emojiArr = Object.values(emojis)
  Promise.all(
    emojiArr.map(async (emoji) => {
      return message.react(emoji)
    }),
  ).catch((err) => {
    console.log(
      `Unable to add reactions to message in ${channel.id} due to ${err}`,
    )
  })
}