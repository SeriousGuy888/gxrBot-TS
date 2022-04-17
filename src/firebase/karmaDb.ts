import { Collection, Snowflake } from "discord.js"
import { firestore } from "firebase-admin"
import NodeCache from "node-cache"
import { db } from "./firebase"
import { getUserData } from "./usersColl"

const karmaCache = new NodeCache()
const pendingChanges = new Collection<Snowflake, number>()

export async function getKarma(userId: Snowflake) {
  const pendingAmt = pendingChanges.get(userId) ?? 0
  if (karmaCache.has(userId)) {
    const cachedAmt = karmaCache.get(userId) as number ?? 0
    return cachedAmt + pendingAmt
  }
  
  const userData = await getUserData(userId)
  karmaCache.set(userId, userData.karma)
  return (userData.karma ?? 0) + pendingAmt
}

export async function addKarma(userId: Snowflake, amount: number) {
  pendingChanges.set(userId, (pendingChanges.get(userId) ?? 0) + amount)
  console.log(`Added ${amount} karma to user ${userId}`)
}

export async function writeKarmaChanges() {
  if (pendingChanges.size === 0)
    return

  const batch = db.batch()
  
  pendingChanges.forEach((karmaChange, userId) => {
    if (karmaChange === 0)
      return

    const ref = db.collection("users").doc(userId)
    const increment = firestore.FieldValue.increment(karmaChange)
    batch.update(ref, { karma: increment })
  })
  
  batch
    .commit()
    .then(() => {
      console.log(`Successfully updated karma of ${pendingChanges.size} users.`)
      pendingChanges.forEach((karmaChange, userId) => {
        if (karmaCache.has(userId))
          karmaCache.set(userId, karmaCache.get(userId) as number + karmaChange)
      })
      pendingChanges.clear()
    })
    .catch(console.error)
}