import "dotenv/config"

const { BOT_TOKEN, CLIENT_ID, GUILD_ID, FIREBASE_ADMIN_SDK_PRIVATE_KEY } = process.env

if(!BOT_TOKEN || !CLIENT_ID || !GUILD_ID || !FIREBASE_ADMIN_SDK_PRIVATE_KEY)
  throw new Error("Missing environment variables.")