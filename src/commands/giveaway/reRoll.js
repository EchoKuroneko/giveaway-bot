import { SlashCommandBuilder, ChannelType } from "discord.js";
import {
	selectWinners,
	determineWinnerCount,
} from "../../utils/giveawayWinners.js";
import {
	getGiveawayById,
	createRerollHistory,
	updateParticipantStatus,
} from "../../database/models.js";
import STATUS from "../../constants/giveawayStatus.js";

export default {
	data: new SlashCommandBuilder()
		.setName("reroll")
		.setDescription("Reroll a giveaway")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("giveaway")
				.setDescription("Reroll a giveaway")
				.addIntegerOption((option) =>
					option
						.setName("id")
						.setDescription(
							"The id of the giveaway to reroll (without 'g')"
						)
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName("winners")
						.setDescription("The number of winners to reroll")
						.setRequired(false)
				)
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription("The channel to reroll the giveaway in")
						.setRequired(false)
						.addChannelTypes(ChannelType.GuildText)
				)
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const gId = "g" + interaction.options.getInteger("id");
		let numWinners = interaction.options.getInteger("winners") || null;
		const channel =
			interaction.options.getChannel("channel") || interaction.channel;
		const guildId = interaction.guild.id;
		const giveaway = await getGiveawayById(guildId, gId, false);
		if (!giveaway) {
			return await interaction.followUp({
				content: `Giveaway with ID: ${gId} does not exist.`,
			});
		}

		const rollDate = new Date();
		numWinners = determineWinnerCount(giveaway, numWinners);
		const previousWinners = giveaway.winners;
		if (
			!numWinners ||
			(numWinners &&
				previousWinners.length === giveaway.participants.length)
		) {
			return await interaction.followUp({
				content:
					"There are no more participants to choose winners from.",
				ephemeral: true,
			});
		}
		const winners = selectWinners(giveaway, numWinners);
		await createRerollHistory({
			gId: giveaway.gId,
			guild: {
				id: giveaway.guild.id,
				name: giveaway.guild.name,
			},
			rollDate: rollDate.toString(),
			numWinners: numWinners,
			previousWinners: previousWinners,
			winners: winners,
		});
		try {
			await updateParticipantStatus(
				guildId,
				gId,
				winners,
				{
					$set: { status: STATUS.WON },
				},
				{
					$set: { status: STATUS.LOST },
				}
			);
		} catch (error) {
			console.error(error);
		}
		await interaction.editReply({
			content: `Giveaway with ID: ${gId} has been rerolled.`,
		});
		// Announce the winner
		return await channel.send(
			`Congratulations ${winners
				.map((winner) => `<@${winner}>`)
				.join(", ")}! You won the **${giveaway.prize}**!`
		);
	},
};
