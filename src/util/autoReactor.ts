import { GuildEmoji, Message } from "discord.js"
import { client } from "../bot"
import { emojiKey, channels } from "../data/auto_reactions.json"
const emojiDictionary = require("emoji-dictionary") // no ts declaration file D:

export async function addReactions(message: Message) {
  if (message.author.id === client.user?.id) return

  // #counting in gxr
  if (message.channel.id === "634597235362889728") {
    countingChannelReactions(message)
  }

  // daily facts channel
  if (message.channel.id === "735708848333258822") {
    dailyFactReactions(message)
  }

  for (const channelId in channels) {
    if (message.channel.id !== channelId) continue

    // get array of reactions for this channel
    const channelReactions = (
      channels as { [key: string]: string[] } & typeof channels
    )[channelId]

    channelReactions.forEach(async (reaction) => {
      const emoji = await getEmojiFromKey(reaction)
      if (!emoji) return

      await message.react(emoji).catch(() => {
        console.log(`Failed to add reaction ${emoji}`)
      })
    })
  }
}

// hardcoded because ive learned that doing this logic with
// json files and regex patterns is an incredibly stupid idea.
async function countingChannelReactions(message: Message) {
  const { content } = message
  const num = parseInt(content)
  if (Number.isNaN(num)) return

  const tenThousandEmoji = client.emojis.resolve("806983127402676225")

  // funny numbers
  if (content.includes("666")) await message.react("6️⃣")
  if (content.endsWith("420")) await message.react("🍀")
  if (content.includes("69"))
    await multiReact(message, ["🇫", "🇺", "🇳", "🇲", "🇾"])

  // palindromes
  if (content.split("").reverse().join("") === content)
    await message.react("🎁")

  // powers of ten
  if (num % 100_000 === 0) await message.react("🏆")
  if (num % 10_000 === 0) await multiReact(message, ["🏅", tenThousandEmoji])
  if (num % 1_000 === 0) await message.react("🎉")
  if (num % 100 === 0) await message.react("💯")
}

// finds emojis relevant to words in the message and adds them
async function dailyFactReactions(message: Message) {
  const words = message.content
    .toLowerCase()
    .replace(/[^a-z0-9 ]/, "")
    .split(" ")

  const emojis: string[] = []
  let emojisFound = 0
  words.forEach((word) => {
    if (emojisFound >= 12) return

    const foundEmoji = emojiDictionary.getUnicode(word)
    if (foundEmoji) {
      emojis.push(foundEmoji)
      emojisFound++
    }
  })

  if (emojis.length > 0) {
    multiReact(message, emojis)
  }
}

async function multiReact(
  message: Message,
  emojis: (string | GuildEmoji | null)[],
) {
  for (let loopEmoji of emojis) {
    if (!loopEmoji) continue

    try {
      await message.react(loopEmoji)
    } catch (error) {
      console.log(`Failed to react with emoji ${loopEmoji}`)
    }
  }
}

async function getEmojiFromKey(name: string) {
  // get value from key in emojiKey
  const emojiId = (
    emojiKey as {
      [key: string]: string
    } & typeof emojiKey
  )[name]

  return client.emojis.resolve(emojiId) ?? name
}
