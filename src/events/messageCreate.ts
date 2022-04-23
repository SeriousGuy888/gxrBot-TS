import { Message } from "discord.js"
import { addVoteReactions } from "../util/karmaManager"
import { Event } from "../interfaces"

async function execute(message: Message) {
  await addVoteReactions(message)
}

export const messageCreate = {
  name: "messageCreate",
  execute,
} as Event
