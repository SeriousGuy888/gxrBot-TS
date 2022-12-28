import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  MessageComponentInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonStyle,
  APIEmbedField,
  MessagePayload,
  ChatInputCommandInteraction,
} from "discord.js"
import { Command } from "../interfaces"
import { formatAsList } from "../util/stringFormatter"
import { fetch } from "undici"

const siteUrl = "https://billzonian.vercel.app/"
const apiUrl = "https://billzonian.vercel.app/api/words/search?q="
const itemsPerPage = 6

interface ApiResponse {
  results: {
    [word: string]: Entry[]
  }
  similarWords?: string[]
}
interface Entry {
  partOfSpeech: string
  pronunciations: string[]
  glosses: string[]
  examples: string[]
  notes: string[]
  alternateForms: string[]
}

const data = new SlashCommandBuilder()
  .setName("billzonian")
  .setDescription("Look up a word in the Billzonian dictionary")
  .addStringOption((option) =>
    option
      .setName("word")
      .setDescription("Search term - Billzonian or English word")
      .setRequired(true),
  )

async function execute(interaction: ChatInputCommandInteraction) {
  const searchTerm = interaction.options.getString("word")?.toLowerCase()

  let response: ApiResponse = { results: {} }
  await fetch(apiUrl + searchTerm)
    .then((data) => data.json())
    .then((data) => (response = data as ApiResponse))
    .catch((err) => {
      interaction.followUp({
        content: `Failed to fetch dictionary data.\nTry again later or visit ${siteUrl}`,
      })
      console.error(err)
    })

  const dictionaryData = response.results
  const wordCount = Object.keys(dictionaryData).length

  const embed = new EmbedBuilder()
    .setColor("#fca503")
    .setTitle("The Billzonian-English Dictionary")
    .setURL(siteUrl)
    .setDescription(
      [
        `Billzonian dictionary also accessible on [the site](${siteUrl}).`,
        "",
        `:mag: Search Term: \`${searchTerm || "[None]"}\``,
        "\u200b",
      ].join("\n"),
    )

  let msg = await interaction.followUp({
    content: "Loading dictionary...",
  })

  if (wordCount === 0) {
    if (response.similarWords?.length) {
      embed.addFields(
        {
          name: "No results. Did you mean...",
          value: response.similarWords.join("\n"),
        },
        { name: "\u200b", value: "\u200b" },
      )
    } else {
      embed.addFields({
        name: "No results.",
        value: "\u200b",
      })
    }

    msg.edit({
      content: "\u200b",
      embeds: [embed],
    })

    return
  }

  let maxPages = Math.ceil(wordCount / itemsPerPage)
  let page = 1

  const displayDictionary = async (
    targetMessage: Message,
    disableButtons: boolean,
  ) => {
    maxPages = Math.ceil(wordCount / itemsPerPage)

    embed.setFooter({ text: `Page ${page} of ${maxPages}` }).setFields([])

    let wordFields: APIEmbedField[] = []
    for (const word in dictionaryData) {
      wordFields.push(...formatWordData(word, dictionaryData[word]))
    }

    const fieldIndexStart = (page - 1) * itemsPerPage
    embed.addFields(
      wordFields.slice(fieldIndexStart, fieldIndexStart + itemsPerPage),
    )

    embed.addFields({ name: "\u200b", value: "\u200b" })

    const buttonRows = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("first")
          .setLabel("First")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("<")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel(">")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page >= maxPages),
        new ButtonBuilder()
          .setCustomId("last")
          .setLabel("Last")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= maxPages),
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("prev10")
          .setLabel("< 10")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 10),
        new ButtonBuilder()
          .setCustomId("prev3")
          .setLabel("< 3")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 3),
        new ButtonBuilder()
          .setCustomId("next3")
          .setLabel("3 >")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= maxPages - 3),
        new ButtonBuilder()
          .setCustomId("next10")
          .setLabel("10 >")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= maxPages - 10),
      ),
    ]
    if (disableButtons) {
      buttonRows.forEach((row) => {
        row.components.forEach((comp) => comp.setDisabled(true))
      })
    }

    return targetMessage.edit(
      new MessagePayload(targetMessage.channel, {
        content: "\u200b",
        embeds: [embed],
        components: buttonRows,
      }),
    )
  }

  msg = await displayDictionary(msg, false)

  const filter = (inter: MessageComponentInteraction) =>
    inter.user.id === interaction.user.id
  const collector = msg.channel
    .createMessageComponentCollector({ filter, time: 60000 })
    .on("collect", async (inter) => {
      collector.resetTimer()

      const buttonId = inter.customId
      switch (buttonId) {
        case "first":
          page = 1
          break
        case "prev10":
          page -= 10
          break
        case "prev3":
          page -= 3
          break
        case "prev":
          page--
          break
        case "next":
          page++
          break
        case "next3":
          page += 3
          break
        case "next10":
          page += 10
          break
        case "last":
          page = maxPages
          break
      }

      page = Math.max(Math.min(maxPages, page), 1)

      inter.deferUpdate().catch(() => {
        /* swallow error */
      })
      displayDictionary(msg, false)
    })
    .on("end", async () => {
      // if the timer expired, edit message and disable all buttons
      displayDictionary(msg, true)
    })
}

const formatWordData = (word: string, entries: Entry[]): APIEmbedField[] => {
  if (!entries) {
    return [
      {
        name: "Error",
        value: "No Data",
        inline: true,
      },
    ]
  }

  const fields: APIEmbedField[] = []
  entries.forEach((entry) => {
    const {
      alternateForms,
      examples,
      glosses,
      notes,
      partOfSpeech,
      pronunciations,
    } = entry

    let ipaLinks = "No IPA transcription provided."
    if (pronunciations) {
      ipaLinks = pronunciations
        .map(
          (e: string) =>
            `/[${e}](http://ipa-reader.xyz/?text=${encodeURI(e)})/`,
        )
        .join(" or ")
    }

    fields.push({
      name: `**${word}** \`${partOfSpeech}\``,
      value: [
        ipaLinks,
        "\u200b",
        formatAsList(glosses, "numbers"),
        formatAsList(examples, "letters"),
        "\u200b",
        formatAsList(notes, "bullets"),
        alternateForms.length && `\`Alt:\` ${alternateForms.join(", ")}`,
      ]
        .filter((e) => e)
        .join("\n"),
      inline: true,
    })
  })

  return fields
}

export const Billzonian = { data, execute } as Command
