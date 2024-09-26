import { SlashCommandBuilder } from "discord.js";
import { updateBlacklistData } from "../../database/roleBlacklist.js";

export default {
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Remove role from blacklist")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("giveaway_blacklist")
				.setDescription("Remove role from blacklist")
				.addRoleOption((option) =>
					option
						.setName("role")
						.setDescription("Role to remove")
						.setRequired(true)
				)
		),
	async execute(interaction) {
		await interaction.deferReply();
		const role = interaction.options.getRole("role");
		const guildId = interaction.guild.id;

		await updateBlacklistData(guildId, {
			$pull: {
				roles: { id: role.id, name: role.name },
			},
		});
		return await interaction.followUp({
			content: `Role ${role} has been removed from the blacklist.`,
		});
	},
};
