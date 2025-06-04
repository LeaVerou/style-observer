export default class Bug {
	constructor ({ name, initialValue, detect }) {
		this.name = name;
		this.initialValue = initialValue ?? true;
		this.detect = detect;

		Bug.all[name] = this;
		Object.defineProperty(Bug, name, {
			get () {
				return this.all[name].value;
			},
			configurable: true,
			enumerable: true,
		});
	}

	#value;
	#valuePending;

	/**
	 * Get whether the bug is present or not, or a promise that will resolve to this value when detection is complete.
	 */
	get valuePending () {
		if (this.#value !== undefined) {
			return this.#value;
		}

		if (this.#valuePending !== undefined) {
			return this.#valuePending;
		}

		this.#valuePending = this.detect();

		if (this.#valuePending instanceof Promise) {
			// Asynchronous detection
			this.#valuePending.then(value => (this.#value = value));
		}
		else {
			// Synchronous detection
			this.#value = this.#valuePending;
		}

		return this.#valuePending;
	}

	/**
	 * Synchronously get either whether the bug is present (if already detected or detection is sync)
	 * or kick off detection and return the initial value if detection is async
	 */
	get value () {
		if (this.#value !== undefined) {
			return this.#value;
		}

		let valuePending = this.valuePending;

		if (valuePending instanceof Promise) {
			// Asynchronous detection
			return this.initialValue;
		}
		else {
			// Synchronous detection
			return valuePending;
		}
	}

	static all = {};

	static detectAll () {
		return Promise.all(Object.values(Bug.all).map(bug => bug.valuePending));
	}
}
