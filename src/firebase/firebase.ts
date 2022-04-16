import admin from "firebase-admin"
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import cron from "node-cron"
import { writeUsersToFirestore } from "./usersColl"

const firebasePrivateKey = process.env.FIREBASE_ADMIN_SDK_PRIVATE_KEY
if (!firebasePrivateKey) throw new Error("No Firebase private Admin SDK key.")

const app = initializeApp({
  credential: admin.credential.cert(JSON.parse(firebasePrivateKey)),
})
export const db = getFirestore(app)

cron.schedule("* */15 * * * *", () => {
  writeUsersToFirestore()
})
