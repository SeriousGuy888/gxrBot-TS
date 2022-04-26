import "./config"
import "./keepAlive"
import { Intents } from "discord.js"
import Client from "./ExtendedClient"
import deployCommands from "./deployCommands"
import deployEvents from "./deployEvents"
import "./firebase/firebase"
import { writeKarmaChanges } from "./firebase/karmaDb"
import { onShutdown } from "node-graceful-shutdown"

export const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: new Intents(32767),
})

client.once("ready", async () => {
  if (!client.user || !client.application) return
  client.user.setPresence({
    status: "online",
    activities: [
      {
        name: "the karma race",
        type: "COMPETING",
      },
    ],
  })

  await deployCommands()
  await deployEvents()
  console.log(`Authenticated as ${client.user.tag}`)
})

client.login(process.env.BOT_TOKEN)

onShutdown(async () => {
  console.log("Graceful shutdown in progress...")
  await writeKarmaChanges()
  console.log("Ready to shutdown.")
})
