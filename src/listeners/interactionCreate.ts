// import { BaseCommandInteraction, Client, Interaction } from "discord.js"
// import { Commands } from "../Commands"

// export default (client: Client): void => {
//   client.on("interactionCreate", async (interaction: Interaction) => {
//     if(interaction.isCommand() || interaction.isContextMenu()) {
//       await handleSlashCommand(client, interaction);
//     }
//   })
// }

// const handleSlashCommand = async (client: Client, interaction: BaseCommandInteraction): Promise<void> => {
//   const command = Commands.find(cmd => cmd.name === interaction.commandName)
//   if(!command) {
//     interaction.followUp({ content: "Error: command not found" })
//     return
//   }

//   await interaction.deferReply()
//   command.run(client, interaction)
// }