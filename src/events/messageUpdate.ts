import { Message } from "discord.js"
import { checkOwsMessage } from "../util/owsChannel"
import { Event } from "../interfaces"
import { checkCultMessage } from "../util/cultChannel"

async function execute(_oldMessage: Message, newMessage: Message) {
  // convert partial (object that contains only the id) to full object
  if (newMessage.partial) newMessage = await newMessage.fetch()

  await checkCultMessage(newMessage)
  await checkOwsMessage(newMessage)
}

export const messageUpdate = {
  name: "messageUpdate",
  execute,
} as Event
