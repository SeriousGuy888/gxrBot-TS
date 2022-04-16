import { MessageReaction, Snowflake, User } from "discord.js"
import { getUserData, setUserData } from "../firebase/usersColl"

enum EmojiId {
  upvote = "713823817004220416",
  downvote = "713824298275569734",
}

export async function processReactionEvent(
  messageReaction: MessageReaction,
  user: User,
  changeMade: "add" | "remove",
) {
  if (messageReaction.partial) messageReaction = await messageReaction.fetch()

  const emojiId: Snowflake = messageReaction.emoji.id as Snowflake
  const messageAuthor = messageReaction.message.author

  if (!Object.values(EmojiId).includes(emojiId as EmojiId)) return
  if (!messageAuthor) return
  if (user.bot || messageAuthor.id === user.id) return

  let change = 1
  if (emojiId === EmojiId.downvote) change *= -1
  if (changeMade === "remove") change *= -1

  await addKarma(messageAuthor.id, change)
}

export async function addKarma(userId: Snowflake, amount: number) {
  let userData = await getUserData(userId)
  userData.karma ??= 0
  userData.karma += amount

  console.log(`Added ${amount} karma to user ${userId}`)
  await setUserData(userId, userData)
}
