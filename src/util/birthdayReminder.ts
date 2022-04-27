import { MessageEmbed } from "discord.js"
import birthdays from "../data/birthdays.json"
import { sendDm } from "./messenger"

interface Birthdays {
  [key: string]: string
}

export async function sendBirthdayReminder(date: Date) {
  const month = date.getMonth() + 1
  const day = date.getDate()

  const todaysBirthdays = []
  for (const name in birthdays) {
    if ((birthdays as Birthdays)[name] === `${month}-${day}`) {
      todaysBirthdays.push(name)
    }
  }

  if (todaysBirthdays.length === 0) return

  const emb = new MessageEmbed()
    .setColor("FUCHSIA")
    .setTitle(":cake: Birthdays Today!")
    .setDescription(
      `Here are the birthdays I have on my list today!\n\`\`\`${todaysBirthdays.join(
        ", ",
      )}\`\`\``,
    )
    .setFooter({ text: "Birthdays for " + date.toISOString().split("T")[0] })

  const msgOpts = { embeds: [emb] }
  try {
    await sendDm("192833577883402240", msgOpts)
    await sendDm("323170410818437130", msgOpts)
  } catch (err) {
    console.log("Failed to send a birthday reminder DM!")
  }
}
