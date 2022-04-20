import { MessageReaction, User } from "discord.js"
import { addKarma } from "../firebase/karmaDb"
import { emojis } from "../data/karma.json"

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
