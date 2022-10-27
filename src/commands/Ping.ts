import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js"
import prettyMs from "pretty-ms"
import { Command } from "src/interfaces"
import { client } from "../bot"

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Returns bot information")

async function execute(interaction: ChatInputCommandInteraction) {
  const age = prettyMs(Date.now() - (client.user?.createdTimestamp ?? 0), {
    verbose: true,
    unitCount: 2,
  })

  const uptimeStr = prettyMs(client.uptime ?? 0)
  let pingEmb = new EmbedBuilder()
    .setColor("#23aa23")
    .setTitle("Pong!")
    .addFields([
      {
        name: ":ping_pong: Shard Ping",
        value: `${client.ws.ping}ms`,
      },
      {
        name: ":clock530: Uptime",
        value: `\`${uptimeStr}\``,
      },
      {
        name: ":cake: Age",
        value: `I'm \`${age}\` old!`,
      },
    ])

  await interaction.followUp({ embeds: [pingEmb] })
}

export const Ping = { data, execute } as Command
