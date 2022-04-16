import { MessageReaction, User } from "discord.js"
import { Event } from "../interfaces"
import { processReactionEvent } from "../util/karmaManager"

async function execute(messageReaction: MessageReaction, user: User) {
  processReactionEvent(messageReaction, user, "remove")
}

export const messageReactionRemove = { name: "messageReactionRemove", execute } as Event