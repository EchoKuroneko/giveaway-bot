import { getDatabase } from "./connect.js";

const dbName = "giveaway";

export async function createGiveaway(giveawayData) {
	const db = await getDatabase(dbName);
	const gCollection = db.collection("events");
	await gCollection.insertOne(giveawayData);
	console.log(`Giveaway ${giveawayData.gId} inserted in database!`);
}