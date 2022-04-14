import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"
import { client } from "./bot"
import * as commandModules from "./commands"

export default async function() {
  const commands = []
  const modules = Object.values(commandModules)
  for(const command of modules) {
    client.commands.set((command.data as any).name, command)
    commands.push(command.data)
  }


  const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN as string)

  try {
    console.log("Deploying slash commands...")

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID as string,
        process.env.GUILD_ID as string,
      ),
      { body: commands }
    )
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      { body: commands }
    )

    console.log("Successfully deployed slash commands.")
  } catch (error) {
    console.error(error)
  }
}