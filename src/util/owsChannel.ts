import { Message } from "discord.js"
import { channelId } from "../data/one_word_story.json"

// ows = one word story
export async function checkOwsMessage(message: Message) {
  if (message.channel.id !== channelId)
    return
  
  if (message.content.includes(" ") || message.attachments.size > 0) {
    try {
      await message.delete()
    } catch (err) {
      console.log("Failed to delete message in one word story")
    }
  }
}