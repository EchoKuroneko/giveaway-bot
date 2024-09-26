import { connectToDatabase } from "./connect.js";

const dbName = "invite_tracker";

export async function fetchUserData(userId, guildId) {
	const db = connectToDatabase(dbName);
	const uCollection = db.collection("users");
	const filter = {
		"user.userId": userId,
		"guild.guildId": guildId,
	};
	try {
		const result = await uCollection.findOne(filter);
		return result;
	} catch (error) {
		console.log(`Error fetching user data: ${error}`);
		return null;
	}
}
