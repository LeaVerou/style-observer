export function toArray(value) {
	if (Array.isArray(value)) {
		return value;
	}

	if (value === undefined || value === null) {
		return [];
	}

	return [value];
}

export function delay(ms) {
	if (ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	return new Promise(resolve => requestAnimationFrame(resolve));
}

/**
 * Parse a CSS <time> value
 * @param {string | number} cssTime - A CSS <time> value
 * @return {number} The time in milliseconds
 */
export function parseTime (cssTime) {
	if (typeof cssTime === "number") {
		return cssTime;
	}

	let match = cssTime.match(/^([+-]?(?:\d+|\d*\.\d+))\s*(ms|s)?$/);
	if (!match) {
		throw new Error(`Invalid time value: ${ cssTime }`);
	}

	let [, value, unit] = match;
	value = parseFloat(value);

	if (unit === "s") {
		value *= 1000;
	}

	return value;
}
