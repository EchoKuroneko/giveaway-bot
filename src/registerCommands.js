import path from "path";
import { fileURLToPath } from "url";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import { REST, Routes } from "discord.js";
import loadCommands from "./utils/loadCommands.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function registerCommands() {
	const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);
	const rawCommands = await loadCommands("../commands");
	try {
		console.log(`Starting to register ${rawCommands.length} {/} commands.`);
		const commands = [];
		for (const command of rawCommands) {
			const commandName = command.data.name;

			console.log(`Registering command: ${commandName}`);
			commands.push(command.data.toJSON());
		}
		let response = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands }
		);

		console.log(`Successfully registered ${response.length} {/} commands.`);
		return;
	} catch (error) {
		console.error(error);
		return;
	}
}

registerCommands();
