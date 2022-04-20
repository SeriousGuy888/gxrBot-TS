import { Message } from "discord.js"
import { Event } from "../interfaces"
import { emojis, voteChannels } from "../data/karma.json"

async function execute(message: Message) {
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

export const messageCreate = {
  name: "messageCreate",
  execute,
} as Event
