import { findBestMatch } from "string-similarity"

export function didYouMean(
  userInput: string,
  possibleValues: string[],
  maxReturnArrLength: number,
) {
  const { ratings } = findBestMatch(userInput, possibleValues)

  // sort by ratings, ascending
  ratings.sort((a, b) => b.rating - a.rating)

  const endAtIndex = Math.min(
    ratings.length - 1,
    Math.floor(maxReturnArrLength),
  )
  return ratings.slice(0, endAtIndex).map((e) => e.target)
}
