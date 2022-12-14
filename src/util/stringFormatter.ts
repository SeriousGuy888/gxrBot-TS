const letters = "abcdefghijklmnopqrstuvwxyz"

export function formatAsList(
  multilineString: string,
  startLineWith: "numbers" | "letters" | "bullets",
) {
  if (!multilineString.trim()) {
    return ""
  }
  
  const lines = multilineString.split("\n")

  if (startLineWith === "bullets") {
    return lines.map((line) => "`•` " + line)
  }

  let currIndex = 0
  if (startLineWith === "numbers") {
    return lines.map((line) => {
      currIndex++
      return "`" + currIndex + ".` " + line
    })
  } else {
    return lines.map((line) => {
      currIndex++
      return "`" + letters.charAt(currIndex % letters.length) + ".` " + line
    })
  }
}
