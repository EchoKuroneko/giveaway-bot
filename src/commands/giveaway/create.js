import {
	EmbedBuilder,
	SlashCommandBuilder,
	ChannelType,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import parseDuration from "../../utils/parseDuration.js";
import giveawayHandler from "../../handlers/giveaway/creationHandler.js";
import { createGiveaway, getNextGId } from "../../database/models.js";

export default {
	data: new SlashCommandBuilder()
		.setName("create")
		.setDescription("Create a giveaway")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("giveaway")
				.setDescription("Create a giveaway")
				.addStringOption((option) =>
					option
						.setName("title")
						.setDescription("The title of the giveaway")
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("prize")
						.setDescription("The prize to give away")
						.setRequired(true)
				)
				.addIntegerOption((option) =>
					option
						.setName("winners")
						.setDescription("The number of winners")
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("duration")
						.setDescription(
							"The duration of the giveaway (e.g., 10m, 1h, 2d, 1d 10h 15m, 1w, 28d)"
						)
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("description")
						.setDescription("The description of the giveaway")
						.setRequired(true)
				)
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription("The channel to create the giveaway in")
						.setRequired(false)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addUserOption((option) =>
					option
						.setName("host")
						.setDescription("The host of the giveaway")
						.setRequired(false)
				)
				.addRoleOption((option) =>
					option
						.setName("role_prize")
						.setDescription("The roles to add to the winners")
						.setRequired(false)
				)
				.addIntegerOption((option) =>
					option
						.setName("messages")
						.setDescription(
							"The number of messages to sent to enter the giveaway"
						)
						.setRequired(false)
				)
				.addIntegerOption((option) =>
					option
						.setName("invites")
						.setDescription(
							"The number of invites required to the enter the giveaway"
						)
						.setRequired(false)
				)
				.addRoleOption((option) =>
					option
						.setName("role_required")
						.setDescription(
							"The roles required to enter the giveaway"
						)
						.setRequired(false)
				)
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const currentTime = Date.now();

		const title = interaction.options.getString("title");
		const prize = interaction.options.getString("prize");
		let numWinners = interaction.options.getInteger("winners");
		const duration = interaction.options.getString("duration");
		const description = interaction.options.getString("description");
		const channel =
			interaction.options.getChannel("channel") || interaction.channel;
		const host = interaction.options.getUser("host") || null;
		const rolePrize = interaction.options.getRole("role_prize") || null;
		const messages = interaction.options.getInteger("messages") || 0;
		const invites = interaction.options.getInteger("invites") || 0;
		const roleRequired =
			interaction.options.getRole("role_required") || null;

		const parsedDuration = parseDuration(duration);

		if (!parsedDuration) {
			return await interaction.followUp(
				"Invalid duration format. Please use a format like 10m, 1hr, 2d, 1d 10h 15m, 1w or 28d."
			);
		}

		if (numWinners < 1) {
			return await interaction.followUp({
				content:
					"Please select a valid winner count! greater or equal to one.",
			});
		}

		const endTime = currentTime + parsedDuration;
		const endTimestamp = Math.floor(endTime / 1000);
		// required fields
		let body = "" + description;
		body += "\n\n";
		body += `Ends: <t:${endTimestamp}:R> (<t:${endTimestamp}:f>)\n`;
		body += `Prize: **${prize}**\n`;
		body += `Winners: ${numWinners.toString()}\n`;

		if (host) {
			body += `Hosted by: ${host}\n`;
		}
		if (rolePrize) {
			body += `Role Prize: ${rolePrize}\n`;
		}
		if (messages) {
			body += `Messages Required: ${messages.toString()}\n`;
		}
		if (invites) {
			body += `Invites Required: ${invites.toString()}\n`;
		}
		if (roleRequired) {
			body += `Role Required: ${roleRequired}\n`;
		}

		body += `Entries: 0\n`;

		const giveawayEmbed = new EmbedBuilder()
			.setTitle(title)
			.setColor(0x55e294)
			.setDescription(body)
			.setTimestamp(currentTime + parsedDuration);

		const button = new ButtonBuilder()
			.setCustomId("confirm")
			.setStyle(ButtonStyle.Primary)
			.setEmoji("🎉");

		const row = new ActionRowBuilder().addComponents(button);
		const giveawayMessage = await channel.send({
			embeds: [giveawayEmbed],
			components: [row],
		});

		// Generate the next gId
		const gId = await getNextGId(interaction.guild.id);

		console.log(`Giveaway created with gId: ${gId}`);

		// Save initial giveaway details to MongoDB
		await createGiveaway({
			gId: gId,
			title: title,
			guild: {
				id: interaction.guild.id,
				name: interaction.guild.name,
			},
			channelId: channel.id,
			messageId: giveawayMessage.id,
			prize: prize,
			rolePrize: rolePrize,
			numWinners: numWinners,
			winners: [],
			host: {
				id: host ? host.id : null,
				username: host ? host.username : null,
			},
			criteria: {
				messages: messages,
				invites: invites,
				role: roleRequired,
			},
			createdBy: {
				id: interaction.user.id,
				username: interaction.user.username,
			},
			createdAt: new Date(currentTime).toString(),
			endAt: new Date(endTime).toString(),
			duration: duration,
			participants: [],
			rerolled: false,
			active: true,
		});

		giveawayHandler(
			gId,
			interaction,
			giveawayMessage,
			currentTime,
			endTime,
			messages,
			invites,
			roleRequired
		);
		return await interaction.followUp({
			content: "Giveaway created successfully!",
			ephemeral: true,
		});
	},
};
