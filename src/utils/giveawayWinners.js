export function selectWinners(giveaway, numWinners) {
	const winners = [];
	const exceptions = giveaway.winners;

	while (winners.length < numWinners) {
		const winner =
			giveaway.participants[
				Math.floor(Math.random() * giveaway.participants.length)
			];
		const wId = winner.user.id;
		// Exclude previous winners on rerolling
		if (exceptions.includes(wId)) continue;
		// Ensure unique winners
		if (!winners.includes(wId)) {
			winners.push(wId);
		}
	}
	return winners;
}

export function determineWinnerCount(giveaway, numWinners = null) {
	const winnerCount = Math.min(
		numWinners ? numWinners : giveaway.numWinners,
		giveaway.participants.length
	);
	return winnerCount;
}
