import { Colors, EmbedBuilder } from "discord.js"
import birthdays from "../data/birthdays.json"
import { sendDm } from "./messenger"

interface Birthdays {
  [key: string]: string
}

export async function sendBirthdayReminders(date: Date) {
  const embed = getBirthdayEmbed(date)
  if (embed) await sendReminderDms(embed)
}

export function getBirthdayEmbed(date: Date) {
  const month = date.getMonth() + 1
  const day = date.getDate()

  const todaysBirthdays = []
  for (const name in birthdays) {
    if ((birthdays as Birthdays)[name] === `${month}-${day}`) {
      todaysBirthdays.push(name)
    }
  }

  if (todaysBirthdays.length === 0) return

  return new EmbedBuilder()
    .setColor(Colors.Fuchsia)
    .setTitle(":cake: Birthdays Today!")
    .setDescription(
      `Here are the birthdays I have on my list today!\n\`\`\`${todaysBirthdays.join(
        ", ",
      )}\`\`\``,
    )
    .setFooter({ text: "Birthdays for " + date.toISOString().split("T")[0] })
}

async function sendReminderDms(embed: EmbedBuilder) {
  const msgOpts = { embeds: [embed] }
  try {
    await sendDm("192833577883402240", msgOpts)
    await sendDm("323170410818437130", msgOpts)
    await sendDm("636530890826055691", msgOpts)
  } catch (err) {
    console.log("Failed to send a birthday reminder DM!")
  }
}
