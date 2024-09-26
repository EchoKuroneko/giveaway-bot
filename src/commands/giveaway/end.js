import {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import endingHandler from "../../handlers/giveaway/endingHandler.js";
import { getGiveawayById } from "../../database/models.js";

export default {
	data: new SlashCommandBuilder()
		.setName("end")
		.setDescription("End a giveaway")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("giveaway")
				.setDescription("End a giveaway")
				.addIntegerOption((option) =>
					option
						.setName("id")
						.setDescription("The id of the giveaway to end")
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
			.setCustomId(`confirm_end_${gId}`)
			.setEmoji("✔")
			.setLabel("Confirm")
			.setStyle(ButtonStyle.Primary);
		const cancelButton = new ButtonBuilder()
			.setCustomId(`cancel_end_${gId}`)
			.setEmoji("❌")
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Secondary);
		const endConfirmation = new ActionRowBuilder().addComponents(
			confirmButton,
			cancelButton
		);
		const endMessage = await interaction.followUp({
			content: `Are you sure you want to end the giveaway with ID: ${gId}?`,
			components: [endConfirmation],
		});

		const filter = (i) =>
			i.user.id === interaction.user.id && i.message.id === endMessage.id;

		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			time: 15000,
		});

		collector.on("collect", async (i) => {
			if (i.customId === `confirm_end_${gId}`) {
				await endingHandler(gId, interaction);
				collector.stop();
				return;
			} else if (i.customId === `cancel_end_${gId}`) {
				collector.stop();
				return;
			}
		});

		collector.on("end", async (collected) => {
			if (collected.size === 0) {
				return await interaction.editReply({
					content: `Giveaway ${gId} ending timed out!`,
					components: [],
					ephemeral: true,
				});
			}
		});
		return;
	},
};
