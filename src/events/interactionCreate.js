import { Events } from "discord.js";

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isCommand()) return;

		// Check if the user has admin permissions
		if (!interaction.member.permissions.has("Administrator")) {
			return await interaction.reply({
				content:
					"You do not have permission to use this command. Admins only!",
				ephemeral: true,
			});
		}

		const command = interaction.client.commands.get(
			interaction.commandName
		);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			);
			return;
		}

		try {
			console.log(`Executing ${interaction.commandName}`);
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			}
		}
	},
};
