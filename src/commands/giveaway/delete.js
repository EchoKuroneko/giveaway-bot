import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
} from "discord.js";
import deletionHandler from "../../handlers/giveaway/deletionHandler.js";
import { getGiveawayById } from "../../database/models.js";

export default {
	data: new SlashCommandBuilder()
		.setName("delete")
		.setDescription("Delete a giveaway")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("giveaway")
				.setDescription("Delete a giveaway")
				.addIntegerOption((option) =>
					option
						.setName("id")
						.setDescription("The id of the giveaway to delete")
						.setRequired(true)
				)
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const gId = "g" + interaction.options.getInteger("id");
		const guildId = interaction.guild.id;
		const giveaway = await getGiveawayById(guildId, gId);
		if (!giveaway) {
			return await interaction.followUp({
				content: `Giveaway with Id: ${gId} does not exist.`,
			});
		}
		const confirmButton = new ButtonBuilder()
			.setCustomId(`confirm_delete_${gId}`)
			.setEmoji("✔")
			.setLabel("Confirm")
			.setStyle(ButtonStyle.Danger);
		const cancelButton = new ButtonBuilder()
			.setCustomId(`cancel_delete_${gId}`)
			.setEmoji("❌")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Secondary);
		const deleteConfirmation = new ActionRowBuilder().addComponents(
			confirmButton,
			cancelButton
		);
		const deletionMessage = await interaction.followUp({
			content: `Are you sure you want to delete the giveaway with ID: ${gId}?`,
			components: [deleteConfirmation],
		});

		deletionHandler(gId, interaction, deletionMessage);
		return;
	},
};
