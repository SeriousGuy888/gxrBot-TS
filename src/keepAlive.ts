import express from "express"
const app = express()

app.get("/", (_, res) => {
  res.send("HTTP server running")
  res.end()
})

app.listen(666, () => {
  console.log("Started HTTP server")
})