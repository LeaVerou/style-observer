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

// https://lea.verou.me/blog/2020/07/introspecting-css-via-the-css-om-getting-supported-properties-shorthands-longhands/
export function getLonghands (property) {
	let style = dummy.style;
	style[property] = "inherit"; // a value that works in every property
	let ret = [...style];

	if (ret.length === 0) {
		// Fallback, in case
		ret = [property];
	}

	style.cssText = ""; // clean up

	return ret;
}

/**
 * Parse a CSS <time> value
 * @param {string } cssTime - A string that contains CSS <time> values
 * @return { number[] } Any times found, in milliseconds
 */
export function parseTimes (cssTime) {
	let matches = cssTime.matchAll(/(?<=^|\s)([+-]?(?:\d+|\d*\.\d+))\s*(ms|s)?(?=\s|$)/g);
	let ret = [];

	for (let match of matches) {
		let [, value, unit] = match;
		value = parseFloat(value);

		if (unit === "s") {
			value *= 1000;
		}

		ret.push(value);
	}

	return ret;
}

const dummy = document.createElement("div");

/**
 * Get the duration and delay of a CSS transition for a given property
 * @param {string} property - The CSS property name
 * @param {string} transition - The computed value of the `transition` property
 * @returns { { duration: number, delay: number } } The duration and delay, in milliseconds
 */
export function getTimesFor (property, transitions) {
	transitions = transitions.split(/,\s*/);
	let propertyRegex;

	if (property === "all") {
		propertyRegex = /\b\w+\b/g;
	}
	else {
		let properties = getLonghands(property);
		properties.push("all");
		propertyRegex = RegExp(`\\b(${ properties.join("|") })\\b`);
	}

	let lastRelevantTransition = transitions.findLast(transition => propertyRegex.test(transition));
	let times = lastRelevantTransition ? parseTimes(lastRelevantTransition) : [0, 0];

	if (times.length === 0) {
		times = [0, 0];
	}
	else if (times.length === 1) {
		times.push(0);
	}

	let [duration, delay] = times;
	return { duration, delay };
}
