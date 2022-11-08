import { MongoClient } from "mongodb";
import { loadConfig } from "@app-config/main";
import { Config } from "./@types/lcdev__app-config";
const cache = new Map();

export default async function get() {
  if (cache.has("client")) return cache.get("client");
  const config: Config = await loadConfig();

  const url = `${config.db_url.url.proto}://${config.db_url.user}:${
    config.db_url.pass
  }@${config.db_url.url.host}:${config.db_url.url.port}${
    config.db_url.url.path || ""
  }${config.db_url.url.query || ""}`;

  const client = new MongoClient(url);
  await client.connect();
  cache.set("client", client.db("timely"));

  return cache.get("client");
}
