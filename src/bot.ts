import "./config"
import { Client, Intents, Interaction } from "discord.js"

import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"
import * as commandModules from "./commands/"
const commands = Object(commandModules)

const client = new Client({ intents: new Intents(32767) })

client.once("ready", async () => {
  if(!client.user || !client.application)
    return
  
  deployCommands()
  console.log(`Authenticated as ${client.user.tag}`)
})

const deployCommands = () => {
  const commandsToDeploy = []
  for(const module of Object.values(commandModules))
    commandsToDeploy.push(module.data.toJSON())

  const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN as string);

  (async () => {
    try {
      console.log("Deploying slash commands...")

      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID as string,
          process.env.GUILD_ID as string,
        ),
        { body: commandsToDeploy }
      )
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID as string),
        { body: commandsToDeploy }
      )

      console.log("Successfully deployed slash commands.")
    } catch (error) {
      console.error(error)
    }
  })()
}




client.on("interactionCreate", async (interaction: Interaction) => {
  if(!interaction.isCommand())
    return
  
  interaction.deferReply()
  commands[interaction.commandName].execute(interaction, client)
})

client.login(process.env.BOT_TOKEN)