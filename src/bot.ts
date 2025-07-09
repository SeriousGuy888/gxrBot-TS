import "./config" // Set up and make sure all the env variables are there
import "./firebase/firebase" // Connect to Firebase, and start updating karma

import cron, { TaskContext } from "node-cron"
import express from "express"
import { IntentsBitField, Partials } from "discord.js"
import { ActivityType } from "discord-api-types/v10"
import { onShutdown } from "node-graceful-shutdown"

import Client from "./ExtendedClient"
import deployCommands from "./deployCommands"
import deployEvents from "./deployEvents"

import { writeKarmaChanges } from "./firebase/karmaDb"
import { sendBirthdayReminders } from "./util/birthdayReminder"

export const client = new Client({
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  intents: new IntentsBitField(131071), // https://ziad87.net/intents/
})

client.once("ready", async () => {
  if (!client.user || !client.application) return
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "the World Cup rn",
        type: ActivityType.Competing,
      },
    ],
  })

  await deployCommands()
  await deployEvents()

  cron.schedule(
    "0 0 * * *",
    async (taskContext: TaskContext) => {
      const date = taskContext.date
      await sendBirthdayReminders(date)
    },
    { timezone: "America/Toronto" },
  )

  console.log(`Authenticated as ${client.user.tag}`)
})

client.login(process.env.BOT_TOKEN)

const app = express()
app.get("/", (req, res) => {
  res.send("Hello, world!")
})
app.get("/ping", (req, res) => {
  res.status(200).send("gxrbot online!")
})
app.listen(10000, () => console.log("Listening for HTTP requests!"))

onShutdown(async () => {
  console.log("Graceful shutdown in progress...")
  await writeKarmaChanges()
  console.log("Ready to shutdown.")
})
