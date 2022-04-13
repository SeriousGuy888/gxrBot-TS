import admin from "firebase-admin"
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const firebasePrivateKey = process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY
if(!firebasePrivateKey)
  throw new Error("No Firebase private Admin SDK key.")

const app = initializeApp({ credential: admin.credential.cert(JSON.parse(firebasePrivateKey)) })
const db = getFirestore(app)


export async function createDocument(userId: string, text: string) {
  try {
    await db.collection("users").add({
      userId,
      text,
    })
  } catch(e) {
    console.error(`Failed to write document: ${e}`)
  }
}