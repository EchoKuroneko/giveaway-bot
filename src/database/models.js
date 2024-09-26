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

export async function getGiveawayById(guildId, gId, active = true) {
	try {
		const db = await getDatabase(dbName);
		const gCollection = db.collection("events");
		const filter = {
			gId: gId,
			"guild.id": guildId,
		};
		if (active) {
			filter.active = true;
		}
		return await gCollection.findOne(filter);
	} catch (error) {
		console.error("Error fetching giveaway by ID:", error);
		throw new Error("Database query failed");
	}
}

export async function getParticipantsByGiveawayId(guildId, gId) {
	const db = await getDatabase(dbName);
	pCollection = db.collection("participants");
	const filter = {
		gId: gId,
		"guild.id": guildId,
	};
	return await pCollection.find(filter).toArray();
}

export async function updateGiveaway(guildId, gId, query) {
	const db = await getDatabase(dbName);
	const gCollection = db.collection("events");
	const filter = {
		gId: gId,
		"guild.id": guildId,
	};
	await gCollection.updateOne(filter, query);
}
