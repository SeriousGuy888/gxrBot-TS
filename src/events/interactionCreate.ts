import { CommandInteraction } from "discord.js"
import { Event } from "../interfaces/"
import { client } from "../bot"

async function execute(interaction: CommandInteraction) {
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
}

export const interactionCreate = { name: "interactionCreate", execute } as Event