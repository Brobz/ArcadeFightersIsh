import { MongoClient } from "mongodb";

const dbURI = process.env.DATABASE_URI;

export default async function connectToDatabase() {
  console.log(">> Connecting to MongoDB...");
  if (dbURI == null)
    throw Error('>> Environment Variable missing: "DATABASE_URI"');
  try {
    const client = await MongoClient.connect(dbURI);
    console.log(">> Successfully Connected to MongoDB!")
    return client.db('AFI_DB');
  } catch (error) {
    console.log('>> Error connecting to MongoDB')
    console.log(error);
    throw error;
  }
}
