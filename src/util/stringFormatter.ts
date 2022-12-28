const letters = "abcdefghijklmnopqrstuvwxyz"

export function formatAsList(
  lines: string[],
  startLineWith: "numbers" | "letters" | "bullets",
) {
  if (startLineWith === "bullets") {
    return lines
      .map((line) => "`•` " + line)
      .join("\n")
      .trim()
  }

  let currIndex = 0
  if (startLineWith === "numbers") {
    return lines
      .map((line) => {
        currIndex++
        return "`" + currIndex + ".` " + line
      })
      .join("\n")
      .trim()
  } else {
    return lines
      .map((line) => {
        currIndex++
        return "`" + letters.charAt(currIndex % letters.length) + ".` " + line
      })
      .join("\n")
      .trim()
  }
}
