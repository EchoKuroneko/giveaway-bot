import { MongoClient } from "mongodb";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

let mongoClient;
let db;

export async function connectToDatabase() {
	try {
		if (!mongoClient) {
			mongoClient = new MongoClient(process.env.MONGO_URI);
			await mongoClient.connect();
			console.log("Connected to MongoDB");
		}
		return mongoClient;
	} catch (error) {
		console.error("Error connecting to MongoDB:", error);
	}
}

export async function getDatabase(dbName) {
	if (!db) {
		if (!mongoClient) {
			await connectToDatabase();
		} else {
			db = mongoClient.db(dbName);
		}
	}
	return db;
}
