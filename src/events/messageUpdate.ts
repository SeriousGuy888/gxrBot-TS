import { Message } from "discord.js"
import { Event } from "../interfaces"
import { checkCultMessage } from "../util/cultChannel"

async function execute(_oldMessage: Message, newMessage: Message) {
  await checkCultMessage(newMessage)
}

export const messageUpdate = {
  name: "messageUpdate",
  execute,
} as Event
