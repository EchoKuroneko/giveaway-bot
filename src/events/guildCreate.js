import { Events } from "discord.js";
import { createBlacklist } from "../database/roleBlacklist.js";

export default {
	name: Events.GuildCreate,
	async execute(guild) {
		console.log(`✅ Joined new guild: ${guild.name}`);

		// Create an empty blacklist for the new guild
		await createBlacklist(guild.id, guild.name);
		console.log(`🛡️ Blacklist created for guild: ${guild.name}`);
	},
};
