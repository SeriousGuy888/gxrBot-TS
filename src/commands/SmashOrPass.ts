import { SlashCommandBuilder } from "@discordjs/builders"
import {
  Collection,
  CommandInteraction,
  GuildMember,
  Interaction,
  InteractionReplyOptions,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Snowflake,
} from "discord.js"
import { Command } from "src/interfaces"

const data = new SlashCommandBuilder()
  .setName("smash_or_pass")
  .setDescription("Start a game of smash or pass")

interface GameState {
  yetPickedColl: Collection<Snowflake, GuildMember>
  pickedColl: Collection<Snowflake, GuildMember>
  smashedIds: Snowflake[]
  passedIds: Snowflake[]
  message?: Message
}

async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) {
    interaction.followUp("This command cannot be used outside of a guild.")
    return
  }

  let gameState: GameState = {
    yetPickedColl: await interaction.guild.members.fetch(),
    pickedColl: new Collection(),
    smashedIds: [],
    passedIds: [],
  }

  await nextTurn(gameState, interaction)
}

const nextTurn = async (
  gameState: GameState,
  interaction: CommandInteraction,
  gameOver = false,
) => {
  const currentPerson = gameOver ? undefined : pickNextPerson(gameState)

  const messagePayload = buildReply(gameState, currentPerson)
  if (!gameState.message)
    gameState.message = (await interaction.followUp(messagePayload)) as Message
  else
    gameState.message = (await interaction.editReply(messagePayload)) as Message

  if (!gameState.message) return
  if (!currentPerson) return

  const filter = (inter: Interaction) => interaction.user.id === inter.user.id
  gameState.message
    .awaitMessageComponent({ filter, componentType: "BUTTON", time: 45_000 })
    .catch(async () => {
      await nextTurn(gameState, interaction, true)
    })
    .then(async (inter) => {
      if (!inter) return
      inter.deferUpdate()

      let nextTurnGameOver = false
      switch (inter.customId) {
        case "smash":
          gameState.smashedIds.push(currentPerson.id)
          break
        case "pass":
          gameState.passedIds.push(currentPerson.id)
          break
        case "exit":
          nextTurnGameOver = true
          break
      }

      await nextTurn(gameState, interaction, nextTurnGameOver)
    })
}

const buildReply = (
  gameState: GameState,
  currentPerson: GuildMember | undefined,
): InteractionReplyOptions => {
  let components: MessageActionRow[] = []

  const embed = new MessageEmbed().setTitle("Smash or Pass").setColor("PURPLE")

  if (currentPerson) {
    embed
      .setDescription(currentPerson.toString())
      .addField("\u200b", "\u200b")
      .addField("🔨 Smashes", gameState.smashedIds.length.toString(), true)
      .addField("🛂 Passes", gameState.passedIds.length.toString(), true)
      .setFooter({ text: `${gameState.yetPickedColl.size} people remaining` })

    components = [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("smash")
          .setLabel("Smash")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId("pass")
          .setLabel("Pass")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId("exit")
          .setLabel("End Game")
          .setStyle("SECONDARY"),
      ),
    ]
  } else {
    const { smashedIds, passedIds } = gameState
    embed
      .setDescription("Game Ended")
      .addField(
        `🔨 People Smashed (${smashedIds.length})`,
        mentionIds(smashedIds),
        true,
      )
      .addField(
        `🛂 People Passed (${passedIds.length})`,
        mentionIds(passedIds),
        true,
      )
  }

  return {
    components,
    embeds: [embed],
  }
}

const mentionIds = (idArray: Snowflake[]) => {
  return idArray.map((val) => `<@${val}>`).join("\n") || "None"
}

const pickNextPerson = ({ yetPickedColl, pickedColl }: GameState) => {
  const pickedKey = yetPickedColl.randomKey()
  if (!pickedKey) return
  const picked = yetPickedColl.get(pickedKey)
  if (!picked) return

  yetPickedColl.delete(pickedKey)
  pickedColl.set(pickedKey, picked)

  return picked
}

export const SmashOrPass = { data, execute } as Command
