import TRANSITIONRUN_EVENT_LOOP_BUG from "./util/detect-transitionrun-loop.js";
import UNREGISTERED_TRANSITION_BUG from "./util/detect-unregistered-transition.js";
import gentleRegisterProperty from "./util/gentle-register-property.js";
import MultiWeakMap from "./util/MultiWeakMap.js";
import { toArray, wait, getTimesFor } from "./util.js";

// We register this as non-inherited so that nested targets work as expected
gentleRegisterProperty("--style-observer-transition", { inherits: false });

/**
 * @typedef { object } StyleObserverOptionsObject
 * @property { string[] } properties - The properties to observe.
 */
/**
 * @typedef { StyleObserverOptionsObject | string | string[] } StyleObserverOptions
 */

/**
 * @callback StyleObserverCallback
 * @param {Record[]} records
 * @returns {void}
 */

/**
 * @typedef { Object } Record
 * @property {Element} target - The element that changed.
 * @property {string} property - The property that changed.
 * @property {string} value - The new value of the property.
 * @property {string} oldValue - The old value of the property.
 */

export default class ElementStyleObserver {
	/**
	 * Observed properties to their old values.
	 * @type {Map<string, string>}
	 */
	properties;

	/**
	 * Get the names of all properties currently being observed.
	 * @type { string[] }
	 */
	get propertyNames () {
		return [...this.properties.keys()];
	}

	/**
	 * The element being observed.
	 * @type {Element}
	 */
	target;

	/**
	 * The callback to call when the element's style changes.
	 * @type {StyleObserverCallback}
	 */
	callback;

	/**
	 * The observer options.
	 * @type {StyleObserverOptions}
	 */
	options;

	/**
	 * Whether the observer has been initialized.
	 * @type {boolean}
	 * @private
	 */
	#initialized = false;

	/**
	 * @param {Element} target
	 * @param {StyleObserverCallback} callback
	 * @param {StyleObserverOptions} options
	 */
	constructor (target, callback, options = {}) {
		this.constructor.all.add(target, this);
		this.properties = new Map();
		this.target = target;
		this.callback = callback;
		this.options = {properties: [], ...options};
		let properties = toArray(options.properties);

		if (properties.length > 0) {
			this.observe(properties);
		}
	}

	/**
	 * Called the first time observe() is called to initialize the target.
	 */
	#init() {
		if (this.#initialized) {
			return;
		}

		let firstTime = this.constructor.all.get(this.target).size === 1;
		this.updateTransition({firstTime});

		this.#initialized = true;
	}

	resolveOptions (options) {
		return Object.assign(resolveOptions(options), this.options);
	}

	/**
	 * @param {TransitionEvent} event
	 */
	async handleEvent (event) {
		if (event.type === "animationstart") {
			let animation = document.getAnimations().find(a => a.effect.target === this.target);

			// Get the observed properties that are being animated by the animation
			let keyframes = animation.effect.getKeyframes();
			let properties = new Set(keyframes.flatMap(frame => 
				Object.keys(frame).filter(property => !["offset", "easing", "composite", "computedOffset"].includes(property))
			));
			properties = [...properties].filter(property => this.properties.has(property));

			if (properties.length === 0) {
				return;
			}
			else {
				let interval = setInterval(() => this.#handleChanges(properties), this.options.animationThrottle ?? 16); // 16ms ~ 60fps

				let cleanup = event => {
					if (event.animationName === animation.animationName) {
						clearInterval(interval);
						this.target.removeEventListener("animationend", cleanup);
						this.target.removeEventListener("animationcancel", cleanup);

						// Pick up the recent changes
						this.#handleChanges(properties);
					}
				};

				this.target.addEventListener("animationend", cleanup);
				this.target.addEventListener("animationcancel", cleanup);
			}
		}
		else if (!this.properties.has(event.propertyName)) {
			return;
		}

		if (TRANSITIONRUN_EVENT_LOOP_BUG && event.type === "transitionrun" || this.options.throttle > 0) {
			let eventName = TRANSITIONRUN_EVENT_LOOP_BUG ? "transitionrun" : "transitionstart";
			let delay = Math.max(this.options.throttle, 50);

			if (TRANSITIONRUN_EVENT_LOOP_BUG) {
				// Safari < 18.2 fires `transitionrun` events too often, so we need to debounce.
				// Wait at least the amount of time needed for the transition to run + 1 frame (~16ms)
				let times = getTimesFor(event.propertyName, getComputedStyle(this.target).transition);
				delay = Math.max(delay, times.duration + times.delay + 16);
			}

			this.target.removeEventListener(eventName, this);
			await wait(delay);
			this.target.addEventListener(eventName, this);
		}

		// Other properties may have changed in the meantime
		this.#handleChanges();
	}

	#handleChanges (properties = this.propertyNames) {
		let cs = getComputedStyle(this.target);
		let records = [];

		for (let property of properties) {
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
	 * Observe the target for changes to one or more CSS properties.
	 * @param {string | string[]} properties
	 * @return {void}
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
				gentleRegisterProperty(property, undefined, this.target.ownerDocument.defaultView);
				this.constructor.properties.add(property);
			}

			let value = cs.getPropertyValue(property);
			this.properties.set(property, value);
		}

		if (TRANSITIONRUN_EVENT_LOOP_BUG) {
			this.target.addEventListener("transitionrun", this);
		}

		this.target.addEventListener("transitionstart", this);
		this.target.addEventListener("transitionend", this);
		this.target.addEventListener("animationstart", this);
		this.updateTransitionProperties();
	}

	/**
	 * Update the `--style-observer-transition` property to include all observed properties.
	 */
	updateTransitionProperties () {
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
			.map(property => `${ property } 1ms step-start`).join(", ");

		this.target.style.setProperty("--style-observer-transition", transition);
	}

	/**
	 * @type { string | undefined }
	 */
	#inlineTransition;

	/**
	 * Update the target's transition property or refresh it if it was overwritten.
	 * @param {object} options
	 * @param {boolean} [options.firstTime] - Whether this is the first time the transition is being set.
	 */
	updateTransition ({firstTime} = {}) {
		const sot = "var(--style-observer-transition, --style-observer-noop)";
		const inlineTransition = this.target.style.transition;
		let transition;

		// NOTE This code assumes that if there is an inline style, it takes precedence over other styles
		// This is not always true (think of !important), but will do for now.
		if (firstTime ? inlineTransition : !inlineTransition.includes(sot)) {
			// Either we are starting with an inline style being there, or our inline style was overwritten
			transition = this.#inlineTransition = inlineTransition;
		}

		if (transition === undefined && (firstTime || !this.#inlineTransition)) {
			// Just update based on most current computed style
			if (inlineTransition.includes(sot)) {
				this.target.style.transition = "";
			}

			transition = getComputedStyle(this.target).transition;
		}

		if (transition === "all") {
			transition = "";
		}

		// Note that in Safari < 18.2 this fires no `transitionrun` or `transitionstart` events:
		// transition: all, var(--style-observer-transition, all);
		// so we can't just concatenate with whatever the existing value is
		const prefix = transition ? transition + ", " : "";
		this.target.style.setProperty("transition", prefix + sot, "important");

		// Set separately to maximize browser support
		this.target.style.setProperty("transition-behavior", "allow-discrete", "important");

		this.updateTransitionProperties();
	}

	/**
	 * Stop observing a target for changes to one or more CSS properties.
	 * @param { string | string[] } [properties] Properties to stop observing. Defaults to all observed properties.
	 * @return {void}
	 */
	unobserve (properties) {
		properties = toArray(properties);

		// Drop properties not being observed anyway
		properties = properties.filter(property => this.properties.has(property));

		for (let property of properties) {
			this.properties.delete(property);
		}

		if (this.properties.size === 0) {
			this.target.removeEventListener("transitionrun", this);
			this.target.removeEventListener("transitionstart", this);
			this.target.removeEventListener("transitionend", this);
			this.target.removeEventListener("animationstart", this);
		}

		this.updateTransitionProperties();
	}

	/** All properties ever observed by this class. */
	static properties = new Set();

	/**
	 * All instances ever observed by this class.
	 */
	static all = new MultiWeakMap();
}

/**
 * Resolve the observer options.
 * @param {StyleObserverOptions} options
 * @returns {StyleObserverOptionsObject}
 */
export function resolveOptions (options) {
	if (!options) {
		return {};
	}

	if (typeof options === "string" || Array.isArray(options)) {
		options = { properties: toArray(options) };
	}
	else if (typeof options === "object") {
		options = { properties: [], ...options };
	}

	return options;
}
