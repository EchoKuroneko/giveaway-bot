import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import scanFolder from "./scanFolder.js";

export default async function loadCommands(pathString) {
	// get loadCommands.js absolute file path
	const __dirname = path.dirname(fileURLToPath(import.meta.url));

	// get all the categories folders within the commands folder
	const categories = scanFolder(path.join(__dirname, pathString), true);

	const commands = [];
	for (const category of categories) {
		// get all the files within the category folder
		const commandFiles = scanFolder(category);
		for (const file of commandFiles) {
			const commandFileUrl = pathToFileURL(file).href;
			const commandObject = (await import(commandFileUrl)).default;
			commands.push(commandObject);
		}
	}
	return commands;
}
