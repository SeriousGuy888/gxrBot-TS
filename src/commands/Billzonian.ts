import { SlashCommandBuilder } from "@discordjs/builders"
import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from "discord.js"
import axios from "axios"
import csv from "csvtojson"
import { Command } from "../interfaces"

const repoUrl = "https://github.com/SeriousGuy888/Billzonian"
const dictionaryUrl = "https://seriousguy888.github.io/Billzonian/vocabulary.csv"


const data = new SlashCommandBuilder()
  .setName("billzonian")
  .setDescription("Look up a word in the Billzonian dictionary")
  .addStringOption(option => option
    .setName("word")
    .setDescription("Search term - Billzonian or English word"))

async function execute(interaction: CommandInteraction) {
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
  let msg = (await interaction.followUp({ content: "Loading dictionary..." })) as Message

  const displayDictionary = async (targetMessage: Message, disableButtons: boolean) => {
    let searchResults = searchDictionaryData(dictionaryData, searchTerm)

    maxPages = Math.ceil(searchResults.length / itemsPerPage)



    const responseEmbed = new MessageEmbed()
      .setColor("#fca503")
      .setTitle("The Billzonian-English Dictionary")
      .setURL(dictionaryUrl)
      .setFooter({ text: `Page ${page} of ${maxPages}` })
      .setDescription([
        "This dictionary is not necessarily a comprehensive collection.",
        `If a word is missing, you can [make an issue here.](${repoUrl})`,
        "",
        `:mag: Search Term: \`${searchTerm || "[None]"}\``,
        "\u200b",
      ].join("\n"))
    


    if(maxPages === 0) {
      responseEmbed
        .addField("No Words Found :(", [
          "Try double checking your search term.",
          "Shu attempt tu reakratise thy search term.",
        ].join("\n"))
        .addField("\u200b", "\u200b")
        // todo: implement similar word matching

      return targetMessage.edit({
        content: null,
        embeds: [responseEmbed],
      })
    }

    
    searchResults.forEach(e => {
      if(e?.word?.toLowerCase() === searchTerm) {
        e.isExactMatch = true
        searchResults = moveArrayItem(searchResults, searchResults.indexOf(e), 0)
      }
    })

    for(let i = 0; i < Math.min(itemsPerPage, searchResults.length); i++) {
      const entryIndex = i + ((page - 1) * itemsPerPage)
      const wordData = searchResults[entryIndex]
    
      addWordToEmbed(wordData, responseEmbed)
    }
    responseEmbed.addField("\u200b", "\u200b")


    const buttonRows = [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("first")
          .setLabel("First")
          .setStyle("SECONDARY")
          .setDisabled(page <= 1),
        new MessageButton()
          .setCustomId("prev")
          .setLabel("<")
          .setStyle("PRIMARY")
          .setDisabled(page <= 1),
        new MessageButton()
          .setCustomId("next")
          .setLabel(">")
          .setStyle("PRIMARY")
          .setDisabled(page >= maxPages),
        new MessageButton()
          .setCustomId("last")
          .setLabel("Last")
          .setStyle("SECONDARY")
          .setDisabled(page >= maxPages),
      ),
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("prev10")
          .setLabel("< 10")
          .setStyle("SECONDARY")
          .setDisabled(page <= 10),
        new MessageButton()
          .setCustomId("prev3")
          .setLabel("< 3")
          .setStyle("SECONDARY")
          .setDisabled(page <= 3),
        new MessageButton()
          .setCustomId("next3")
          .setLabel("3 >")
          .setStyle("SECONDARY")
          .setDisabled(page >= maxPages - 3),
        new MessageButton()
          .setCustomId("next10")
          .setLabel("10 >")
          .setStyle("SECONDARY")
          .setDisabled(page >= maxPages - 10),
      )
    ]
    if(disableButtons) {
      buttonRows.forEach(row => {
        row.components.forEach(comp => comp.setDisabled(true))
      })
    }

    return targetMessage.edit({
      content: null,
      embeds: [responseEmbed],
      components: buttonRows,
    })
  }

  msg = await displayDictionary(msg, false)

  const filter = (inter: MessageComponentInteraction) => inter.user.id === interaction.user.id
  const collector = msg.channel.createMessageComponentCollector({ filter, time: 60000 })
    .on("collect", async (inter) => {
      collector.resetTimer()

      const buttonId = inter.customId
      switch(buttonId) {
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

      inter.deferUpdate().catch(() => { /* swallow error */ })
      displayDictionary(msg, false)
    })
    .on("end", async () => {
      // if the timer expired, edit message and disable all buttons
      displayDictionary(msg, true)
    })
}


const searchDictionaryData = (dictionaryData: any[], searchTerm: string | undefined) => {
  return dictionaryData.filter(e => (
    e.word.toLowerCase().includes(searchTerm)
    || e.translation.toLowerCase().includes(searchTerm)
    || e.alt_forms.toLowerCase().includes(searchTerm)
  ))
}

const addWordToEmbed = (wordData: any, embed: MessageEmbed) => {
  const ipaReadings = wordData.ipa.split("|")
  const alts = wordData.alt_forms.split("|")
  const translation = wordData.translation
  const example = wordData.example
  const notes = wordData.notes

  let ipaReadingsString = "No IPA transcription provided."
  if(wordData.ipa) {
    ipaReadingsString = ipaReadings
      .map((e: string) => `/[${e}](http://ipa-reader.xyz/?text=${encodeURI(e)})/`)
      .join(" or ")
  }

  embed.addField(
    `${wordData.word && "**" + wordData.word + "**"} \`${wordData.pos}\`${wordData.isExactMatch ? " ⭐" : ""}`,
    [
      ipaReadingsString,
      wordData.alt_forms && `\`Alt:\` ${alts.join(", ")}`,
      listify(translation, "numbers"),
      listify(example, "letters"),
      listify(notes, "bullets"),
    ].filter(e => e).join("\n"),
    true
  )
}


const listify = (str: string, startLineWith: ("numbers" | "letters" | "bullets")) => {
  if(!str)
    return ""

  const lines = str.split("|")
  const numberedLines = []
  const letters = "abcdefghijklmnopqrstuvwxyz"
  for(let i = 0; i < lines.length; i++) {
    let bullet
    switch(startLineWith) {
      case "numbers":
        bullet = `\`${(i + 1).toString() + "."}\``
        break
      case "letters":
        bullet = "`" + letters.charAt(i % letters.length) + ".`"
        break
      case "bullets":
        bullet = "\`•\`"
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