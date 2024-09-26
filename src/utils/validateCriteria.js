import {
	getUserMessages,
	getUserInvites,
	getUserCriteria,
} from "../database/userCriteria.js";

export default async function validateCriteria(
	guildId,
	userId,
	requiredMessages,
	requiredInvites,
	roleRequired,
	hasRole
) {
	let [messages, invites] = [0, 0];
	if (requiredMessages && requiredInvites) {
		[messages, invites] = await getUserCriteria(userId, guildId);
	} else {
		// Fetch user's messages
		if (requiredMessages && messages === 0) {
			messages = await getUserMessages(userId, guildId);
		}
		// Fetch user's invites
		if (requiredInvites && invites === 0) {
			invites = await getUserInvites(userId, guildId);
		}
	}

	let criteriaNotMet = [];
	if (requiredMessages && messages < requiredMessages) {
		criteriaNotMet.push(`${requiredMessages} messages`);
	}
	if (requiredInvites && invites < requiredInvites) {
		criteriaNotMet.push(`${requiredInvites} invites`);
	}
	if (roleRequired && !hasRole) {
		criteriaNotMet.push(`the role ${roleRequired}`);
	}

	return criteriaNotMet;
}
