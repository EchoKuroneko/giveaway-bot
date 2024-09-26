import { EmbedBuilder } from "discord.js";
import {
	getGiveawayById,
	updateGiveaway,
	createParticipant,
} from "../../database/models.js";
import STATUS from "../../constants/giveawayStatus.js";
import validateCriteria from "../../utils/validateCriteria.js";
import endingHandler from "./endingHandler.js";

export default async function giveawayHandler(
	gId,
	interaction,
	giveawayMessage,
	currentTime,
	endTime,
	requiredMessages,
	requiredInvites,
	roleRequired
) {
	// Set up button interaction handler
	const filter = (i) =>
		i.customId === "confirm" && i.message.id === giveawayMessage.id;

	const collector = giveawayMessage.createMessageComponentCollector({
		filter,
		time: endTime - currentTime,
	});

	collector.on("collect", async (i) => {
		const userId = i.user.id;
		const guild = i.guild;
		const guildId = guild.id;

		// Fetch giveaway data from DB using giveawayId
		const giveaway = await getGiveawayById(guildId, gId);

		const joinedAt = new Date();
		// Check if the user is already entered in the giveaway
		let alreadyEntered = false;
		if (giveaway.participants) {
			alreadyEntered = giveaway.participants.some(
				(participant) => participant.user.id === userId
			);
		}

		if (alreadyEntered) {
			// User already entered, inform them
			return await i.reply({
				content: "You have already entered this giveaway!",
				ephemeral: true,
			});
		}

		const hasRole = i.member.roles.cache.has(roleRequired);

		// Construct the response if criteria are not met
		const criteriaNotMet = validateCriteria(
			guildId,
			userId,
			requiredMessages,
			requiredInvites,
			roleRequired,
			hasRole
		);

		if (criteriaNotMet.length > 0) {
			return i.reply({
				content: `You need at least ${criteriaNotMet.join(
					", "
				)} to enter.`,
				ephemeral: true,
			});
		}

		const user = {
			id: userId,
			name: i.user.username,
		};

		// Add participant to the giveaway
		await updateGiveaway(guildId, gId, {
			$push: { participants: { user } },
		});

		await createParticipant({
			uId: userId,
			username: i.user.username,
			guild: {
				id: guildId,
				name: guild.name,
			},
			gId: gId,
			status: STATUS.ENTERED,
			joinedAt: joinedAt.toString(),
		});

		await i.reply({
			content: "You've successfully entered the giveaway!",
			ephemeral: true,
		});

		// Update giveaway embed to reflect new entries
		const entriesEmbed = EmbedBuilder.from(
			giveawayMessage.embeds[0]
		).setDescription(
			giveawayMessage.embeds[0].description.replace(
				/Entries: \d+/,
				`Entries: ${giveaway.participants.length + 1}`
			)
		);

		giveawayMessage.edit({ embeds: [entriesEmbed] });
	});

	// When the giveaway ends
	collector.on("end", async () => {
		await endingHandler(gId, interaction, giveawayMessage);
	});
}
