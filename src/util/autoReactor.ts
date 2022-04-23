import { GuildEmoji, Message } from "discord.js"
import { client } from "../bot"

export async function addReactions(message: Message) {
  // #counting in gxr
  if (message.channel.id === "634597235362889728")
    countingChannelReactions(message)
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
