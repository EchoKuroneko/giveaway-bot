import { SlashCommandBuilder } from "discord.js";
import { updateBlacklistData } from "../../database/roleBlacklist.js";

export default {
	data: new SlashCommandBuilder()
		.setName("add")
		.setDescription("Add role to blacklist")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("giveaway_blacklist")
				.setDescription("Blaclist role from taking part in giveaway")
				.addRoleOption((option) =>
					option
						.setName("role")
						.setDescription("Role to add")
						.setRequired(true)
				)
		),
	async execute(interaction) {
		await interaction.deferReply();
		const role = interaction.options.getRole("role");
		const guildId = interaction.guild.id;

		await updateBlacklistData(guildId, {
			$addToSet: {
				roles: { id: role.id, name: role.name },
			},
		});
		return await interaction.followUp({
			content: `Role ${role} has been added to the blacklist.`,
		});
	},
};
