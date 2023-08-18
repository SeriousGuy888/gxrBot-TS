import { Message } from "discord.js"
import cult from "../data/cult.json"

export async function checkCultMessage(message: Message) {
  if (message.channel.id !== cult.channelId) return

  const msgContent = normaliseText(message.content)
  const cultPhrase = normaliseText(cult.phrase)
  if (msgContent === cultPhrase) return

  try {
    await message.delete()

    if (message.author.bot) return
    await message.author.send(
      `Hey, so you seem to have misspelled \`${cult.phrase}\`.` +
        ` Don't worry, \`${message.content.slice(0, 100)}\`` +
        " is a very common misspelling. I've gone ahead and nuked" +
        " your message. Try to be a better cult member next time.",
    )
  } catch (error) {}
}

/**
 * Normalises text by removing diacritics and converting to lowercase.
 */
function normaliseText(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD") // https://stackoverflow.com/a/51874461
    .replace(/\p{Diacritic}/gu, "")
}
