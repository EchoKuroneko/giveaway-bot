import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { fetchActiveGiveaways } from "../../database/models.js";

export default {
	data: new SlashCommandBuilder()
		.setName("list")
		.setDescription("View giveaway related items")
		.addSubcommandGroup((group) =>
			group
				.setName("active")
				.setDescription("View active items")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("giveaway")
						.setDescription("Lists active giveaway")
				)
		),
	async execute(interaction) {
		const activeGiveaways = await fetchActiveGiveaways(
			interaction.guild.id
		);

		let description, color;

		if (activeGiveaways.length === 0) {
			description = "**There are no active giveaways at the moment.**";
			color = 0xff0000;
		} else {
			description = activeGiveaways
				.map((giveaway, index) => {
					const endTime = new Date(giveaway.endAt).getTime();
					const endTimestamp = Math.floor(endTime / 1000);
					const body = `${index + 1}. \`\`${giveaway.gId}\`\` **${
						giveaway.title
					}** (${
						giveaway.participants ? giveaway.participants.length : 0
					} Entries)
			\n\t- Ends: <t:${endTimestamp}:R>`;
					return body;
				})
				.join("\n");
			color = 0x0099ff;
		}

		const giveawayEmbed = new EmbedBuilder()
			.setAuthor({
				name: interaction.guild.name,
				iconURL: interaction.guild.iconURL(),
			})
			.setTitle(`Active Giveaways`)
			.setDescription(description)
			.setColor(color)
			.setTimestamp();
		return interaction.reply({
			embeds: [giveawayEmbed],
		});
	},
};
