import { Message } from "discord.js"
import { addVoteReactions } from "../util/karmaManager"
import { Event } from "../interfaces"
import { checkCultMessage } from "../util/cultChannel"
import { addReactions } from "../util/autoReactor"
import { checkOwsMessage } from "../util/owsChannel"

async function execute(message: Message) {
  // convert partial (object that contains only the id) to full object
  if (message.partial) message = await message.fetch()

  await addVoteReactions(message)
  await checkCultMessage(message)
  await checkOwsMessage(message)
  await addReactions(message)
}

export const messageCreate = {
  name: "messageCreate",
  execute,
} as Event
