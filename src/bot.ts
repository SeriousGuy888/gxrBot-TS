import "./config"
import { Intents } from "discord.js"
import Client from "./ExtendedClient"
import deployCommands from "./deployCommands"
import deployEvents from "./deployEvents"

export const client = new Client({ intents: new Intents(32767) })

client.once("ready", async () => {
  if(!client.user || !client.application)
    return
  
  await deployCommands()
  await deployEvents()
  console.log(`Authenticated as ${client.user.tag}`)
})

client.login(process.env.BOT_TOKEN)