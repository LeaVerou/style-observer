/**
 * A WeakMap to implement 2D mappings
 */
export default class WeakMapMap extends WeakMap {
	has (key, subKey) {
		if (arguments.length === 1) {
			return super.has(key);
		}

		let map = super.get(key);
		return map?.has(subKey) || false;
	}

	set (key, subKey, value) {
		let map = super.get(key) ?? new Map();
		map.set(subKey, value);
		super.set(key, map);
	}

	get (key, subKey) {
		if (arguments.length === 1) {
			return super.get(key);
		}

		let map = super.get(key);
		return map?.get(subKey);
	}

	delete (key, subKey) {
		if (arguments.length === 1) {
			super.delete(key);
			return;
		}

		let map = super.get(key);
		map?.delete(subKey);
		if (map?.size === 0) {
			super.delete(key);
		}
	}
}
