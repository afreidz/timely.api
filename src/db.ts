import { MongoClient } from "mongodb";
const cache = new Map();

export default async function get() {
  if (cache.has("client")) return cache.get("client");

  const url = process.env.AC_DB_URL || "";

  const client = new MongoClient(url);
  await client.connect();
  cache.set("client", client.db("timely"));

  return cache.get("client");
}
