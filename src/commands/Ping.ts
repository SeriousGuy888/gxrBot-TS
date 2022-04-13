import { SlashCommandBuilder } from "@discordjs/builders"
import { APIMessage } from "discord-api-types/v10"
import { CommandInteraction, MessageEmbed } from "discord.js"
import prettyMs from "pretty-ms"
import { client } from "../bot"

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Returns bot information")

export async function execute(interaction: CommandInteraction) {
  const age = prettyMs(Date.now() - (client.user?.createdTimestamp ?? 0), {
    verbose: true,
    unitCount: 2,
  })

  const uptimeStr = prettyMs(client.uptime ?? 0)
  let pingEmb = new MessageEmbed()
    .setColor("#23aa23")
    .setTitle("Pong!")
    .addField(":ping_pong: Shard Ping", `${client.ws.ping}ms`)
    .addField(":clock530: Uptime", `\`${uptimeStr}\``)
    .addField(":cake: Age", `I'm \`${age}\` old!`)

  await interaction.followUp({ embeds: [pingEmb] })
}