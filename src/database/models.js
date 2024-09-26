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

export async function getNextGId(guildId) {
	const db = await getDatabase(dbName);
	const gCollection = db.collection("events");
	const filter = {
		"guild.id": guildId,
	};
	// Find the document with the highest gId
	const lastGiveaway = await gCollection.findOne(filter, {
		sort: { gId: -1 },
	});

	let nextId = 1; // Default to 1 if no documents exist
	if (lastGiveaway && lastGiveaway.gId) {
		// Extract the numeric part and increment it
		const currentId = parseInt(lastGiveaway.gId.slice(1), 10);
		nextId = currentId + 1;
	}

	return `g${nextId}`;
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

export async function fetchActiveGiveaways(guildId) {
	const db = await getDatabase(dbName);
	const gCollection = db.collection("events");
	const filter = {
		"guild.id": guildId,
		active: true,
	};
	return await gCollection.find(filter).toArray();
}

export async function deactivateGiveaway(guildId, gId, activity) {
	// Mark giveaway as inactive in DB
	await updateGiveaway(guildId, gId, {
		$set: { active: !activity },
	});
}
