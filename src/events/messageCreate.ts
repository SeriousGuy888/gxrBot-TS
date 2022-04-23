import { Message } from "discord.js"
import { addVoteReactions } from "../util/karmaManager"
import { Event } from "../interfaces"
import { checkCultMessage } from "../util/cultChannel"
import { addReactions } from "../util/autoReactor"

async function execute(message: Message) {
  await addVoteReactions(message)
  await checkCultMessage(message)
  await addReactions(message)
}

export const messageCreate = {
  name: "messageCreate",
  execute,
} as Event
