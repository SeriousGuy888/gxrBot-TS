import { Client, Collection } from "discord.js"
import { Command } from "./interfaces/Command"

export default class ExtendedClient extends Client {
  commands: Collection<string, Command> = new Collection()
}