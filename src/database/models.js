import { getDatabase } from "./connect.js";

const dbName = "giveaway";

export async function createGiveaway(giveawayData) {
	const db = await getDatabase(dbName);
	const gCollection = db.collection("events");
	await gCollection.insertOne(giveawayData);
	console.log(`Giveaway ${giveawayData.gId} inserted in database!`);
}

// Participant model functions
export async function createParticipant(participantData) {
	const db = await getDatabase(dbName);
	const pCollection = db.collection("participants");
	await pCollection.insertOne(participantData);
	console.log(
		`Participant ${participantData.uId} for ${participantData.gId} inserted in database!`
	);
}
