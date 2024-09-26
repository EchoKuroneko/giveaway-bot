import { deactivateGiveaway } from "../../database/models.js";

export default async function deletionHandler(
	gId,
	interaction,
	deletionMessage
) {
	const filter = (i) =>
		i.user.id === interaction.user.id &&
		i.message.id === deletionMessage.id;

	const collector = interaction.channel.createMessageComponentCollector({
		filter,
		time: 15000,
	});

	collector.on("collect", async (i) => {
		if (i.customId === `confirm_delete_${gId}`) {
			const guildId = interaction.guild.id;
			await deactivateGiveaway(guildId, gId, true);
			await interaction.editReply({
				content: `Giveaway ${gId} has been deleted!`,
				components: [],
				ephemeral: false,
			});
			collector.stop();
		} else if (i.customId === `cancel_delete_${gId}`) {
			await interaction.editReply({
				content: `Giveaway ${gId} deletion cancelled!`,
				components: [],
			});
			collector.stop();
		}
	});

	collector.on("end", (collected) => {
		if (collected.size === 0) {
			interaction.editReply({
				content: `Giveaway ${gId} deletion timed out!`,
				components: [],
				ephemeral: true,
			});
		}
	});
}
