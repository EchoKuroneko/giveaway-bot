import path from "path";
import scanFolder from "../utils/scanFolder.js";
import { fileURLToPath, pathToFileURL } from "url";

export default async function eventHandler(client) {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const eventFiles = scanFolder(path.join(__dirname, "../events"));

	for (const file of eventFiles) {
		const eventUrl = pathToFileURL(file).href;
		// const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
		const importedModule = await import(eventUrl);
		const event = importedModule.default;
		triggerEvent(client, event);
	}
}

function triggerEvent(client, event) {
	if (event.name && typeof event.execute === "function") {
		client.on(event.name, async (...args) => {
			console.log(`Calling ${event.name}...`);
			await event.execute(...args);
		});
	}
}
