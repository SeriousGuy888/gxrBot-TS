import "./config"
import { Intents, Interaction } from "discord.js"
import Client from "./ExtendedClient"
import deployCommands from "./deployCommands"

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

  const command = client.commands.get(interaction.commandName.toLowerCase())
  if(command) {
    await interaction.deferReply()
    command.execute(interaction)
  } else {
    interaction.reply({
      content: "Command not found",
      ephemeral: true
    })
  }
})

client.login(process.env.BOT_TOKEN)