import { getDatabase } from "./connect.js";

const dbName = "giveaway";

export async function createBlacklist(guildId, guildName) {
	const db = await getDatabase(dbName);
	const bCollection = db.collection("blacklist");
	const filter = {
		"guild.guildId": guildId,
	};
	const result = await bCollection.findOne(filter);
	if (!result) {
		const data = {
			guild: {
				guildId: guildId,
				guildName: guildName,
			},
			roles: [],
		};
		try {
			return await bCollection.insertOne(data);
		} catch (error) {
			console.log(
				`Failed to create blacklist for guild ${guildName}: ${error}`
			);
			return null;
		}
	}
	return;
}
