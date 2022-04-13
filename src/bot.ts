import "./config"
import { Client, Intents, Interaction } from "discord.js"
import deployCommands from "./deployCommands"
import * as commandModules from "./commands/"
const commands = Object(commandModules)

export const client = new Client({ intents: new Intents(32767) })

client.once("ready", async () => {
  if(!client.user || !client.application)
    return
  
  await deployCommands()
  console.log(`Authenticated as ${client.user.tag}`)
})

client.on("interactionCreate", async (interaction: Interaction) => {
  if(!interaction.isCommand())
    return
  interaction.deferReply()
  commands[interaction.commandName].execute(interaction, client)
})

client.login(process.env.BOT_TOKEN)