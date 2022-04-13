import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"
import * as commandModules from "./commands/_CommandList"

export default async function() {
  const commandsToDeploy = []
  for(const module of Object.values(commandModules))
    commandsToDeploy.push(module.data.toJSON())

  const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN as string)

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
}