import { MongoClient } from "mongodb";

const dbclient = new MongoClient(
  "mongodb://timely-test:K2sD629SlMx8IzOgzg67KkWhmw1EmySkWUs5q14GHcnPHz6mutHWa57bvjYrqaCjOebtOjvIFpKWACDbKtdKiQ==@timely-test.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@timely-test@"
);

export function connect() {
  return dbclient.connect();
}

export const client = dbclient.db("timely");
