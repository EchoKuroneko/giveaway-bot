import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import loadCommands from "./utils/loadCommands.js";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import eventsHandler from "./handlers/eventsHandler.js";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
	],
});

const commands = await loadCommands("../commands");

client.commands = new Collection();

for (const command of Object.values(commands)) {
	client.commands.set(command.data.name, command);
}

eventsHandler(client);

await client.login(process.env.DISCORD_BOT_TOKEN);