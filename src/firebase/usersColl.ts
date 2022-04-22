import { Snowflake } from "discord.js"
import NodeCache from "node-cache"
import { db } from "./firebase"

const cache = new NodeCache()
const changedValues = new Set<string>()

interface UserData {
  karma: number
  [key: string]: any
}

export async function getUserData(userId: Snowflake): Promise<UserData> {
  if (cache.has(userId)) return cache.get(userId) as UserData

  const userSnapshot = await db.collection("users").doc(userId).get()

  // merges incoming data from firestore with an instance of the
  // UserData interface, so the function doesn't ever return undefined.
  const userData = {
    ...(<UserData>{}),
    ...userSnapshot.data(),
  }

  writeToUserCache(userId, userData)
  return userData
}

/**
 * Overwrite whatever is in the cache for the given user ID.
 * Will not be permanently written to the database.
 * Used for when data has just been fetched and no data has changed.
 * @param userId UserID
 * @param data New cache data
 */
export function writeToUserCache(userId: Snowflake, data: Object) {
  cache.set(userId, data)
}


// /**
//  * Merges provided user data to the current user data, which may be cached.
//  * Merged data is written to the cache immediately and will be written to
//  * Firestore later.
//  * @param userId User ID
//  * @param data Changes to make to user data
//  */
// export async function setUserData(userId: Snowflake, data: Object) {
//   const userData = {
//     ...(await getUserData(userId)),
//     ...data,
//   }
//   changedValues.add(userId)
//   cache.set(userId, userData)
// }

// export async function writeUsersToFirestore() {
//   if (changedValues.size === 0) return

//   const valuesToWrite = cache.mget<Object>(Array.from(changedValues))
//   const batch = db.batch()

//   for (const id in valuesToWrite) {
//     const ref = db.collection("users").doc(id)
//     batch.set(ref, valuesToWrite[id], { merge: true })
//   }

//   batch
//     .commit()
//     .then(() => {
//       console.log(`Successfully updated data of ${changedValues.size} users.`)
//       changedValues.clear()
//     })
//     .catch(console.error)
// }
