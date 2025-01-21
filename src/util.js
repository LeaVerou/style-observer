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
