import http from "http"

http.createServer((req, res) => {
  res.write("HTTP server running.")
  res.end()
}).listen(8080)