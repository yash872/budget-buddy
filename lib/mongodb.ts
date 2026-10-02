import { MongoClient, type Db } from "mongodb";

const DB_NAME = "budgetbuddy";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local (see .env.local.example)."
    );
  }
  const client = new MongoClient(uri);
  return client.connect();
}

/**
 * Lazily creates (and caches on the global object) the Mongo connection.
 * Deliberately NOT connected at module-load time — Next.js collects route
 * config at build time by importing route modules, which would otherwise
 * throw if MONGODB_URI isn't set in the build environment.
 */
export async function getDb(): Promise<Db> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  const client = await global._mongoClientPromise;
  return client.db(DB_NAME);
}
