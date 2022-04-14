import { client } from "./bot"
import * as eventModules from "./events/"

export default async function() {
  for(const event of Object.values(eventModules)) {
    client.on(event.name, event.execute)
  }
}