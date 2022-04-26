import express from "express"
import { stdin } from "process"
const app = express()

app.get("/", (_, res) => {
  res.send("HTTP server running")
  res.end()
})

app.post("/refresh", async (req, res) => {
  console.log("repl.deploy" + req.body + req.header("Signature"))

  const result: {
    body: string
    status: number
  } = JSON.parse((await getStdinLine())!)

  res.sendStatus(result.status).end(result.body)
  console.log("repl.deploy-success")
})

app.listen(8080, () => {
  console.log("Started HTTP server")
})

async function getStdinLine() {
  const chunks = []
  for await (const chunk of stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString("utf8")
}
