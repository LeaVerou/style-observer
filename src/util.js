export function toArray(value) {
	if (Array.isArray(value)) {
		return value;
	}

	if (value === undefined || value === null) {
		return [];
	}

	return [value];
}

export function wait (ms) {
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
 * @param {string} transitions - The computed value of the `transition` property
 * @returns { { duration: number, delay: number } } The duration and delay, in milliseconds
 */
export function getTimesFor (property, transitions) {
	transitions = split(transitions);
	let propertyRegex;

	if (property === "all") {
		propertyRegex = /\b\w+\b/g;
	}
	else {
		let properties = [...new Set([...getLonghands(property), property, "all"])];
		propertyRegex = RegExp(`(?<=^|\\s)(${ properties.join("|") })\\b`);
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

/**
 * Escape special characters in a string for use in a regular expression.
 * @param {string} string
 * @returns {string} The escaped string.
 */
export function regexEscape (string) {
	return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Split a value by a separator, respecting parentheses.
 * @param {string} value - The value to split.
 * @param {string} [separator] - The separator to split on. Defaults to `,`.
 * @returns {string[]} The split values.
 */
export function split (value, separator = ",") {
	value = value.trim();

	// Make whitespace optional and flexible
	separator = separator.trim();
	let separatorRegex = RegExp(regexEscape(separator).replace(/^\s*|\s*$/g, "\\s*"), "g");
	let parensRegex = /\(|\)/g;

	if (!parensRegex.test(value)) {
		// value contains no parentheses, just split
		return value.trim().split(separatorRegex);
	}

	let splitter = RegExp([separatorRegex.source, parensRegex.source].join("|"), "g");
	let stack = [];
	let items = [];
	let item = "";
	let matches = [...value.matchAll(splitter)];
	let lastIndex = 0;

	for (let i = 0; i < matches.length; i++) {
		let match = matches[i];
		let index = match.index;
		let matched = match[0];
		let part = value.slice(lastIndex, index);

		if (matched.trim() === separator) {
			if (stack.length === 0) {
				// No open parentheses, add to items
				items.push(part.trim());
				lastIndex = index + matched.length;
			}
		}
		else if (matched === "(") {
			stack.push("(");
		}
		else if (matched === ")") {
			stack.pop();
		}
	}

	if (lastIndex < value.length || item.length > 0) {
		item += value.slice(lastIndex);
		items.push(item.trim());
	}

	return items;
}
