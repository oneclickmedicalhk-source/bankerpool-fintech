import { Db, MongoClient } from "mongodb"
import { assertServerEnv, getAppEnv } from "@/lib/utils/env"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

/**
 * Create and cache a single MongoDB connection across requests.
 */
export async function getDb() {
  if (cachedDb) {
    return cachedDb
  }

  assertServerEnv()
  const { mongodbUri, mongodbDbName } = getAppEnv()

  if (!cachedClient) {
    cachedClient = new MongoClient(mongodbUri)
    await cachedClient.connect()
  }

  cachedDb = cachedClient.db(mongodbDbName)
  return cachedDb
}
