import { MongoClient } from "mongodb";

const dbclient = new MongoClient(process.env.AZURE_COSMOS_URL || "");

export function connect() {
  return dbclient.connect();
}

export const client = dbclient.db("timely");
