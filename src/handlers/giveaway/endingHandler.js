import { EmbedBuilder } from "discord.js";
import {
	determineWinnerCount,
	selectWinners,
} from "../../utils/giveawayWinners.js";
import {
	getGiveawayById,
	updateParticipantStatus,
	updateGiveaway,
} from "../../database/models.js";
import STATUS from "../../constants/giveawayStatus.js";

export default async function endingHandler(gId, interaction, message = null) {
	const guildId = interaction.guildId;
	// Fetch giveaway data from DB using giveawayId
	const giveaway = await getGiveawayById(guildId, gId);
	const channelId = await giveaway.channelId;
	const channel = await interaction.guild.channels.fetch(channelId);

	if (!message) {
		message = await channel.messages.fetch(giveaway.messageId);
	}

	let numWinners, mentionWinners;
	let winners = [];
	if (giveaway.participants.length === 0) {
		await interaction.editReply({
			content: "No one entered the giveaway.",
			ephemeral: true,
			components: [],
		});
		await updateGiveaway(guildId, gId, {
			$set: { active: false },
		});
		await channel.send("Giveaway ended. No one entered the giveaway.");
	} else {
		numWinners = determineWinnerCount(giveaway);
		winners = selectWinners(giveaway, numWinners);
		mentionWinners = winners.map((winner) => `<@${winner}>`).join(", ");
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
		// Announce the winner
		await message.channel.send(
			`Congratulations ${mentionWinners}! You won the **${giveaway.prize}**!`
		);
	}

	const newWinnersMessage = `Winners: ${
		mentionWinners ? mentionWinners : "0 Participants"
	}`;

	// Update giveaway embed to reflect new entries
	const endedEmbed = EmbedBuilder.from(message.embeds[0]).setDescription(
		message.embeds[0].description
			.replace(/Ends/, `Ended`)
			.replace(/Winners: \d+/, newWinnersMessage)
	);
	await message.edit({ embeds: [endedEmbed], components: [] });

	// Mark giveaway as inactive in DB
	await updateGiveaway(guildId, gId, {
		$set: { winners: winners, active: false },
	});
	return;
}
