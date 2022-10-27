import {
  Collection,
  CommandInteraction,
  GuildMember,
  Interaction,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  Snowflake,
  SlashCommandBuilder,
  ComponentType,
  ButtonStyle,
  Colors,
  ChatInputCommandInteraction,
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

async function execute(interaction: ChatInputCommandInteraction) {
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
  if (!gameState.message) {
    gameState.message = await interaction.followUp(messagePayload)
  } else {
    gameState.message = await interaction.editReply(messagePayload)
  }

  if (!gameState.message) return
  if (!currentPerson) return

  const filter = (inter: Interaction) => interaction.user.id === inter.user.id
  gameState.message
    .awaitMessageComponent({
      filter,
      componentType: ComponentType.Button,
      time: 45_000,
    })
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
): any => {
  let components: ActionRowBuilder[] = []

  const embed = new EmbedBuilder()
    .setTitle("Smash or Pass")
    .setColor(Colors.Purple)

  if (currentPerson) {
    embed
      .setDescription(currentPerson.toString())
      .addFields([
        { name: "\u200b", value: "\u200b" },
        {
          name: "🔨 Smashes",
          value: gameState.smashedIds.length.toString(),
          inline: true,
        },
        {
          name: "🛂 Passes",
          value: gameState.passedIds.length.toString(),
          inline: true,
        },
      ])
      .setFooter({ text: `${gameState.yetPickedColl.size} people remaining` })

    components = [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("smash")
          .setLabel("Smash")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("pass")
          .setLabel("Pass")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("exit")
          .setLabel("End Game")
          .setStyle(ButtonStyle.Secondary),
      ),
    ]
  } else {
    const { smashedIds, passedIds } = gameState
    embed.setDescription("Game Ended").addFields(
      {
        name: `🔨 People Smashed (${smashedIds.length})`,
        value: mentionIds(smashedIds),
        inline: true,
      },
      {
        name: `🛂 People Passed (${passedIds.length})`,
        value: mentionIds(passedIds),
        inline: true,
      },
    )
  }

  return {
    components,
    embeds: [embed],
  }
}

const mentionIds = (idArray: Snowflake[]) => {
  return (
    idArray
      .map((val) => `<@${val}>`)
      .join("\n")
      .slice(0, 1023) || "None"
  )
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
