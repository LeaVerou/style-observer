import TRANSITIONSTART_EVENT_LOOP_BUG from "./util/detect-transitionstart-loop.js";
import UNREGISTERED_TRANSITION_BUG from "./util/detect-unregistered-transition.js";
import gentleRegisterProperty from "./util/gentle-register-property.js";
import MultiWeakMap from "./util/MultiWeakMap.js";
import { toArray, delay } from "./util.js";

// We register this as non-inherited so that nested targets work as expected
gentleRegisterProperty("--style-observer-transition", { inherits: false });

/**
 * @typedef { object } StyleObserverOptionsObject
 * @property { string[] } properties - The properties to observe.
 */
/**
 * @typedef { StyleObserverOptionsObject | string | string[] } StyleObserverOptions
 */

export default class ElementStyleObserver {
	/**
	 * Observed properties to their old values
	 * @type {Map<string, string>}
	 */
	properties;

	/**
	 * Get the names of all properties currently being observed
	 * @type { string[] }
	 */
	get propertyNames () {
		return [...this.properties.keys()];
	}

	/**
	 * @param {Element} target
	 */
	target;

	/**
	 * @param {function} callback
	 */
	callback;

	/**
	 * @param {StyleObserverOptions} options
	 */
	options;

	/**
	 * @type {boolean}
	 * @private
	 */
	#initialized = false;

	constructor (target, callback, options = {}) {
		this.constructor.all.add(target, this);
		this.properties = new Map();
		this.target = target;
		this.callback = callback;
		this.options = {...options, properties: []};
		let properties = toArray(options.properties);

		if (properties) {
			this.observe(properties);
		}
	}

	/**
	 * Called the first time observe() is called to initialize the target
	 */
	#init() {
		if (this.#initialized) {
			return;
		}

		if (this.constructor.all.get(this.target).size === 1) {
			// We don't need to do this multiple times for the same target
			let transition = getComputedStyle(this.target).transition;
			let prefix = !transition || transition === "all" ? "" : transition + ", ";

			// Note that in Safari < 18.2 this fires no `transitionstart` events:
			// transition: all, var(--style-observer-transition, all);
			// so we can't just concatenate with whatever the existing value is
			this.target.style.transition = prefix + "var(--style-observer-transition, all)";
		}

		this.#initialized = true;
	}

	resolveOptions (options) {
		return Object.assign(resolveOptions(options), this.options);
	}

	async handleEvent (event) {
		if (!this.properties.has(event.propertyName)) {
			return;
		}

		if (TRANSITIONSTART_EVENT_LOOP_BUG || this.options.throttle > 0) {
			// Safari < 18.2 fires `transitionstart` events too often, so we need to debounce
			this.target.removeEventListener("transitionstart", this);
			await delay(this.options.throttle || 50);
			this.target.addEventListener("transitionstart", this);
		}

		let cs = getComputedStyle(this.target);
		let records = [];

		// Other properties may have changed in the meantime
		for (let property of this.propertyNames) {
			let value = cs.getPropertyValue(property);
			let oldValue = this.properties.get(property);

			if (value !== oldValue) {
				records.push({ target: this.target, property, value, oldValue });
				this.properties.set(property, value);
			}
		}

		if (records.length > 0) {
			this.callback(records);
		}
	}

	/**
	 * Observe the target for changes to one or more CSS properties
	 * @param {string | string[]} properties
	 * @void
	 */
	observe (properties) {
		properties = toArray(properties);

		// Drop properties already being observed
		properties = properties.filter(property => !this.properties.has(property));

		if (properties.length === 0) {
			// Nothing new to observe
			return;
		}

		this.#init();

		let cs = getComputedStyle(this.target);

		for (let property of properties) {
			if (UNREGISTERED_TRANSITION_BUG && !this.constructor.properties.has(property)) {
				// Init property
				gentleRegisterProperty(property);
				this.constructor.properties.add(property);
			}

			let value = cs.getPropertyValue(property);
			this.properties.set(property, value);
		}

		this.target.addEventListener("transitionstart", this);
		this.#updateTransition();
	}

	/**
	 * Update the transition property to include all observed properties
	 */
	#updateTransition () {
		// Clear our own transition
		this.target.style.setProperty("--style-observer-transition", "");

		let transitionProperties = new Set(getComputedStyle(this.target).transitionProperty.split(", "));
		let properties = [];

		for (let observer of this.constructor.all.get(this.target)) {
			properties.push(...observer.propertyNames);
		}

		properties = [...new Set(properties)]; // Dedupe

		// Only add properties not already present and not excluded
		let transition = properties
			.filter(property => !transitionProperties.has(property))
			.map(property => `${ property } 1ms step-start allow-discrete`).join(", ");

		this.target.style.setProperty("--style-observer-transition", transition);
	}

	/**
	 * Stop observing a target for changes to one or more CSS properties.
	 * @param { string | string[] } [properties] Properties to stop observing. Defaults to all observed properties.
	 * @void
	 */
	unobserve (properties) {
		properties = toArray(properties);

		// Drop properties not being observed anyway
		properties = properties.filter(property => this.properties.has(property));

		for (let property of properties) {
			this.properties.delete(property);
		}

		if (this.properties.size === 0) {
			this.target.removeEventListener("transitionstart", this);
		}

		this.#updateTransition();
	}

	/** All properties ever observed by this class */
	static properties = new Set();

	/**
	 * All instances ever observed by this class
	 */
	static all = new MultiWeakMap();
}

export function resolveOptions (options) {
	if (!options) {
		return {};
	}

	if (typeof options === "string" || Array.isArray(options)) {
		options = { properties: toArray(options) };
	}

	return options;
}
