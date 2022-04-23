import { Message } from "discord.js"
import cult from "../data/cult.json"

export async function checkCultMessage(message: Message) {
  if (message.channel.id !== cult.channelId) return
  if (message.content.toLowerCase() === cult.phrase.toLowerCase()) return

  try {
    await message.delete()
    await message.author.send(
      `Hey, so you seem to have misspelled \`${cult.phrase}\`.` +
      ` Don't worry, \`${message.content.slice(0, 100)}\`` +
      " is a very common misspelling. I've gone ahead and nuked" +
      " your message. Try to be a better cult member next time.",
    )
  } catch (error) {}
}
