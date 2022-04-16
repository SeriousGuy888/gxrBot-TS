import { Client, Collection } from "discord.js"
import { Command } from "./interfaces/Command"

export default class ExtendedClient extends Client {
  commands = new Collection<string, Command>()
}
