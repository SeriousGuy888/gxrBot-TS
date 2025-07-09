import { Events, Interaction } from "discord.js"
import { Event } from "../interfaces/"
import { client } from "../bot"

async function execute(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) {
    return
    // After this, we know `interaction` is of type `ChatInputCommandInteraction`
  }

  const command = client.commands.get(interaction.commandName.toLowerCase())
  if (command) {
    await interaction.deferReply()
    command.execute(interaction)
  } else {
    interaction.reply({
      content: "Command not found",
      ephemeral: true,
    })
  }
}

export const interactionCreate = {
  name: Events.InteractionCreate,
  execute,
} as Event
