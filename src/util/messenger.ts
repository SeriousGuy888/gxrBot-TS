import { BaseMessageOptions, MessagePayload, Snowflake } from "discord.js"
import { client } from "../bot"

export async function sendDm(
  userId: Snowflake,
  content: string | MessagePayload | BaseMessageOptions,
) {
  const user = await client.users.fetch(userId)
  if (!user) throw new Error("User not found")

  user.send(content).catch((err) => {
    throw new Error(err)
  })
}
