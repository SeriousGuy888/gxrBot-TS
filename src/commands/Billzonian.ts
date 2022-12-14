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
import axios from "axios"
import csv from "csvtojson"
import { Command } from "../interfaces"
import { didYouMean } from "../util/similarStringFinder"

const repoUrl = "https://github.com/SeriousGuy888/Billzonian"
const dictionaryUrl =
  "https://seriousguy888.github.io/Billzonian/vocabulary.csv"

const data = new SlashCommandBuilder()
  .setName("billzonian")
  .setDescription("Look up a word in the Billzonian dictionary")
  .addStringOption((option) =>
    option
      .setName("word")
      .setDescription("Search term - Billzonian or English word"),
  )

async function execute(interaction: ChatInputCommandInteraction) {
  let response
  try {
    response = await axios.get(dictionaryUrl)
  } catch (error) {
    interaction.followUp({ content: "Could not fetch dictionary data." })
    return
  }

  const dictionaryData = await csv().fromString(response.data)
  const itemsPerPage = 3
  const searchTerm = interaction.options.getString("word")?.toLowerCase()
  let maxPages = Math.ceil(dictionaryData.length / itemsPerPage)
  let page = 1
  let msg = await interaction.followUp({
    content: "Loading dictionary...",
  })

  const displayDictionary = async (
    targetMessage: Message,
    disableButtons: boolean,
  ) => {
    let searchResults = searchDictionaryData(dictionaryData, searchTerm)

    maxPages = Math.ceil(searchResults.length / itemsPerPage)

    const responseEmbed = new EmbedBuilder()
      .setColor("#fca503")
      .setTitle("The Billzonian-English Dictionary")
      .setURL(dictionaryUrl)
      .setFooter({ text: `Page ${page} of ${maxPages}` })
      .setDescription(
        [
          "This dictionary is not necessarily a comprehensive collection.",
          `If a word is missing, you can [make an issue here.](${repoUrl})`,
          "",
          `:mag: Search Term: \`${searchTerm || "[None]"}\``,
          "\u200b",
        ].join("\n"),
      )

    if (maxPages === 0) {
      const similarWords = didYouMean(
        searchTerm ?? "",
        dictionaryData.map((e) => e.word),
        10,
      )

      responseEmbed.addFields(
        {
          name: "No words found! Did you mean...",
          value: similarWords.join("\n"),
        },
        { name: "\u200b", value: "\u200b" },
      )

      return targetMessage.edit({
        content: "\u200b",
        embeds: [responseEmbed],
      })
    }

    searchResults.forEach((e) => {
      if (e?.word?.toLowerCase() === searchTerm) {
        e.isExactMatch = true
        searchResults = moveArrayItem(
          searchResults,
          searchResults.indexOf(e),
          0,
        )
      }
    })

    let wordFields: APIEmbedField[] = []
    for (let i = 0; i < Math.min(itemsPerPage, searchResults.length); i++) {
      const entryIndex = i + (page - 1) * itemsPerPage
      const wordData = searchResults[entryIndex]

      wordFields.push(formatWordData(wordData))
    }

    responseEmbed.addFields(wordFields)
    responseEmbed.addFields({ name: "\u200b", value: "\u200b" })

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
        embeds: [responseEmbed],
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

const searchDictionaryData = (
  dictionaryData: any[],
  searchTerm: string | undefined,
) => {
  if (!searchTerm) return dictionaryData
  return dictionaryData.filter(
    (e) =>
      e.word.toLowerCase().includes(searchTerm) ||
      e.translation.toLowerCase().includes(searchTerm) ||
      e.alt_forms.toLowerCase().includes(searchTerm),
  )
}

const formatWordData = (wordData: any): APIEmbedField => {
  if (!wordData) {
    return {
      name: "Error",
      value: "No Data",
      inline: true,
    }
  }

  const ipaReadings = wordData.ipa.split("|")
  const alts = wordData.alt_forms.split("|")
  const translation = wordData.translation
  const example = wordData.example
  const notes = wordData.notes

  let ipaReadingsString = "No IPA transcription provided."
  if (wordData.ipa) {
    ipaReadingsString = ipaReadings
      .map(
        (e: string) => `/[${e}](http://ipa-reader.xyz/?text=${encodeURI(e)})/`,
      )
      .join(" or ")
  }

  return {
    name: `${wordData.word && "**" + wordData.word + "**"} \`${wordData.pos}\`${
      wordData.isExactMatch ? " ⭐" : ""
    }`,
    value: [
      ipaReadingsString,
      listify(translation, "numbers"),
      listify(example, "letters"),
      "-",
      listify(notes, "bullets"),
      wordData.alt_forms && `\`Alt:\` ${alts.join(", ")}`,
    ]
      .filter((e) => e)
      .join("\n"),
    inline: true,
  }
}

const listify = (
  str: string,
  startLineWith: "numbers" | "letters" | "bullets",
) => {
  if (!str) return ""

  const lines = str.split("|")
  const numberedLines = []
  const letters = "abcdefghijklmnopqrstuvwxyz"
  for (let i = 0; i < lines.length; i++) {
    let bullet
    switch (startLineWith) {
      case "numbers":
        bullet = `\`${(i + 1).toString() + "."}\``
        break
      case "letters":
        bullet = "`" + letters.charAt(i % letters.length) + ".`"
        break
      case "bullets":
        bullet = "•"
        break
    }

    numberedLines.push(`${bullet} ${lines[i]}`)
  }

  return numberedLines.join("\n")
}

const moveArrayItem = (array: any[], fromIndex: number, toIndex: number) => {
  const arr = [...array]
  arr.splice(toIndex, 0, ...arr.splice(fromIndex, 1))
  return arr
}

export const Billzonian = { data, execute } as Command
