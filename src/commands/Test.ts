import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getUserData, setUserData, writeUsersToFirestore } from "../firebase/usersColl"
import { Command } from "../interfaces"

const data = new SlashCommandBuilder()
  .setName("test")
  .setDescription("test")
  .addUserOption(option => {
    return option
      .setName("user")
      .setDescription("user")
      .setRequired(true)
  })

async function execute(interaction: CommandInteraction) {
  const user = interaction.options.getUser("user")!
  let userData = await getUserData(user.id)
  userData.karma ??= 0
  userData.karma++

  await setUserData(user.id, userData)
  await interaction.followUp({ content: `added 1 karma to ${user.tag}` })
}

export const Test = { data, execute } as Command