import { MessageReaction, User } from "discord.js"
import { Event } from "../interfaces"
import { processReactionEvent } from "../util/karmaManager"

async function execute(messageReaction: MessageReaction, user: User) {
  if (messageReaction.partial) messageReaction = await messageReaction.fetch()
  processReactionEvent(messageReaction, user, "add")
}

export const messageReactionAdd = {
  name: "messageReactionAdd",
  execute,
} as Event
