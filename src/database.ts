import { MongoClient } from "mongodb";

const dbURI = process.env.DATABASE_URI;

export default async function connectToDatabase() {
  console.log(">> Connecting to MongoDB...");
  const client = await MongoClient.connect(dbURI);
  console.log(">> Successfully Connected to MongoDB!")
  return client.db('AFI_DB');
}
