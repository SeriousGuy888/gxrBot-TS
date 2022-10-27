import { SlashCommandBuilder } from "@discordjs/builders"
import {
  BaseGuildTextChannel,
  GuildChannelResolvable,
  Message,
  EmbedBuilder,
  PermissionFlagsBits,
  Webhook,
  ChatInputCommandInteraction,
  Colors,
} from "discord.js"
import { Command } from "../interfaces"
import { promisify } from "util"
import { client } from "../bot"

const delay = promisify(setTimeout)

const data = new SlashCommandBuilder()
  .setName("spam_ping")
  .setDescription("pester a person that you hate (or sincerely love)")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The person to spam ping")
      .setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName("times")
      .setDescription("How many times to ping this person")
      .setMinValue(1)
      .setMaxValue(25)
      .setAutocomplete(true)
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName("ghost_ping")
      .setDescription(
        "Delete mentions after sending to ghost ping this person.",
      ),
  )
  .addStringOption((option) =>
    option
      .setName("custom_message")
      .setDescription(
        "A custom message that you want to be sent with the ping.",
      ),
  )

async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    interaction.followUp("Please use this command in a server.")
    return
  }

  const author = interaction.guild.members.resolve(interaction.user)
  if (
    !author ||
    !author
      .permissionsIn(interaction.channel as GuildChannelResolvable)
      .has(PermissionFlagsBits.ManageMessages, true)
  ) {
    interaction.followUp(
      `Missing permission \`Manage Members\` or \`Administrator\`.`,
    )
    return
  }

  const user = interaction.options.getUser("user", true)
  const times = interaction.options.getInteger("times", true)
  const shouldGhostPing = interaction.options.getBoolean("ghost_ping") ?? false
  const customMessage =
    interaction.options.getString("custom_message")?.slice(0, 200) ??
    "get pinged lol"

  const title = shouldGhostPing ? "Ghost-Pinger" : "Spam-Pinger"

  const responseEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle(title)
    .setDescription(`Pinging ${user} ${times} times.`)
  interaction.followUp({ embeds: [responseEmbed], ephemeral: shouldGhostPing })

  const avatarUrl = client.user?.avatarURL() ?? undefined
  const ping = async (w: Webhook, str: string) => {
    w.send({
      content: str,
      username: title,
      avatarURL: avatarUrl,
    })
      .then((m) => {
        if (shouldGhostPing && m instanceof Message) m.delete()
      })
      .catch((error) => interaction.followUp(error))
  }

  const channel = interaction.channel
  if (!(channel instanceof BaseGuildTextChannel)) {
    interaction.editReply("Somethign went wrogn")
    return
  }

  const hookName = "Spam-Pinger"
  const webhooks = await (channel as BaseGuildTextChannel).fetchWebhooks()

  let webhook = webhooks.find((w) => {
    return w.name.includes(hookName) && w?.owner?.id === client?.user?.id
  })
  if (!webhook) {
    webhook = await channel.createWebhook({ name: hookName, avatar: avatarUrl })
  }

  for (let i = 0; i < times; i++) {
    await ping(
      webhook,
      `${user}, ${customMessage}` +
        `(From ${interaction.user.tag} \`${i + 1}/${times}\`)`,
    )
    await delay(2000)
  }
}

export const SpamPing = { data, execute } as Command
