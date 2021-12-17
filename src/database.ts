import { MongoClient } from "mongodb";

const dbURI = process.env.DATABASE_URI;

export default async function connectToDatabase() {
  console.log(">> Connecting to MongoDB...");
  if (dbURI == null) {
    throw Error('You should add the environmental variable DATABASE_URI');
  }
  const client = await MongoClient.connect(dbURI);
  console.log(">> Successfully Connected to MongoDB!")
  return client.db('AFI_DB');
}
