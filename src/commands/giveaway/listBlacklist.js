import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { fetchBlacklist } from "../../database/roleBlacklist.js";

export default {
	data: new SlashCommandBuilder()
		.setName("giveaway")
		.setDescription("View giveaway related items")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("blacklist")
				.setDescription("List blacklisted roles")
		),
	async execute(interaction) {
		await interaction.deferReply();
		const blacklist = await fetchBlacklist(interaction.guild.id);

		let description, color;

		if (
			!blacklist ||
			!Array.isArray(blacklist.roles) ||
			blacklist.roles.length === 0
		) {
			description = "**There are no roles that are blacklisted.**";
			color = 0xff0000;
		} else {
			description = blacklist.roles
				.map((role, index) => {
					const body = `${index + 1}. <@&${role.id}>`;
					return body;
				})
				.join("\n");
			color = 0x0099ff;
		}

		const blacklistEmbed = new EmbedBuilder()
			.setAuthor({
				name: interaction.guild.name,
				iconURL: interaction.guild.iconURL(),
			})
			.setTitle(`Blacklisted Role`)
			.setDescription(description)
			.setColor(color)
			.setTimestamp();
		return interaction.followUp({
			embeds: [blacklistEmbed],
		});
	},
};
