import TIME_UNITS from "../constants/timeUnits.js";

// Function to parse the duration string and get duration in miliseconds
export default function parseDuration(duration) {
	duration = duration.toLowerCase();
	// Regex to capture numeric values followed by optional space and a unit
	const regex = /(\d+)\s*([smhdw])/g;
	let totalMiliSeconds = 0;

	let match;
	while ((match = regex.exec(duration))) {
		const value = parseInt(match[1], 10);
		const unit = match[2];

		const conversion = TIME_UNITS.find(u=> u.name === unit);
		if (conversion) {
			totalMiliSeconds += value * conversion.value;
		} else {
			return null; // Invalid unit
		}
	}

	return totalMiliSeconds > 0 ? totalMiliSeconds : null;
}
