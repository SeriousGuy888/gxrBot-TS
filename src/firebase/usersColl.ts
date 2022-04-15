import NodeCache from "node-cache"
import { db } from "./firebase"

const cache = new NodeCache()
const changedValues = new Set<string>()

interface UserData {
  karma: number
  [key: string]: any
}


export async function getUserData(id: string): Promise<UserData> {
  if(cache.has(id))
    return cache.get(id) as UserData
  
  const userSnapshot = await db
    .collection("users")
    .doc(id)
    .get()
  
  // merges incoming data from firestore with an instance of the
  // UserData interface, so the function doesn't ever return undefined.
  const userData = {
    ...<UserData>{},
    ...userSnapshot.data(),
  }

  cache.set(id, userData)
  return userData
}

/**
 * Merges provided user data to the current user data, which may be cached.
 * Merged data is written to the cache and will be written to Firestore later.
 * @param id User ID
 * @param data Changes to make to user data
 */
export async function setUserData(id: string, data: Object) {
  const userData = {
    ...await getUserData(id),
    ...data
  }

  changedValues.add(id)
  cache.set(id, userData)
}

export async function writeUsersToFirestore() {
  if(changedValues.size === 0)
    return
  
  const valuesToWrite = cache.mget<Object>(Array.from(changedValues))
  const batch = db.batch()
  
  for(const id in valuesToWrite) {
    const ref = db
      .collection("users")
      .doc(id)
    batch.set(ref, valuesToWrite[id], { merge: true })
  }

  batch.commit().then(() => {
    console.log(`Successfully updated data of ${changedValues.size} users.`)
    changedValues.clear()
  }).catch(console.error)
}