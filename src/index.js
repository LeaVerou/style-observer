import TRANSITIONSTART_EVENT_LOOP_BUG from "./util/detect-transitionstart-loop.js";
import UNREGISTERED_TRANSITION_BUG from "./util/detect-unregistered-transition.js";
import MultiWeakMap from "./util/MultiWeakMap.js";
import WeakMapMap from "./util/WeakMapMap.js";
import gentleRegisterProperty from "./util/gentle-register-property.js";

// We register this as non-inherited so that nested targets work as expected
gentleRegisterProperty("--style-observer-transition", { inherits: false });

/**
 * @typedef { Object | string | string[] } StyleObserverOptions
 * @property {string[]} properties - The properties to observe.
 */

export default class StyleObserver {
	/**
	 * Elements to observed properties
	 * @type {MultiWeakMap<Element, string>}
	 */
	observed = new MultiWeakMap();

	/**
	 * All elements to observed properties, across all instances
	 * @type {MultiWeakMap<Element, string>}
	 */
	static observed = new MultiWeakMap();

	/**
	 * @type {WeakMapMap<Element, Map<string, string>>}
	 */
	static oldValues = new WeakMapMap();

	static observedProperties = new Set();

	/**
	 * @param {function} callback
	 * @param {StyleObserverOptions} options
	 */
	constructor (callback, options) {
		this.callback = callback;
		this.options = resolveOptions(options);
		this.observed = new MultiWeakMap();
	}

	resolveOptions (options) {
		return Object.assign(resolveOptions(options), this.options);
	}

	handleEvent (event) {
		console.log(event);
		let observedProperties = this.observed.get(event.target);

		let { propertyName, pseudoElement, target } = event;
		if (!observedProperties || !observedProperties.has(propertyName)) {
			return;
		}

		let value = getComputedStyle(target).getPropertyValue(propertyName);
		let oldValue = this.constructor.oldValues.get(target, propertyName);

		if (value === oldValue) {
			return;
		}

		let record = { target, propertyName, pseudoElement, value, oldValue};

		this.callback([record]);

		if (TRANSITIONSTART_EVENT_LOOP_BUG) {
			let target = event.target;
			target.removeEventListener("transitionstart", this);

			requestAnimationFrame(() => {
				// If we re-add the listener, it won't fix the bug.
				// The `transitionstart` events fire infinitely, so we get the same result as before.
				// We should find a way to stop all the transitions related to the property from firing.
				target.addEventListener("transitionstart", this);
			});
		}
	}

	static handleEvent = function handleEvent (event) {
		requestAnimationFrame(() => {
			// All individual listeners must have finished by now
			let {target, propertyName} = event;
			let currentValue = getComputedStyle(target).getPropertyValue(propertyName);
			this.oldValues.set(target, propertyName, currentValue);
		});
	}.bind(this);

	/**
	 * Observe a certain target for changes to one or more CSS properties
	 * @param {Element} target
	 * @param {StyleObserverOptions} options
	 * @void
	 */
	observe (target, options) {
		options = this.resolveOptions(options);
		target.addEventListener("transitionstart", this);

		for (let property of options.properties) {
			this.observed.add(target, property);
		}

		this.constructor.observe(target, options);
	}

	/**
	 * Observe a certain target for changes to one or more CSS properties
	 * @param {Element} target
	 * @param {StyleObserverOptions} options
	 * @void
	 */
	static observe (target, options) {
		if (!this.observed.has(target)) {
			this._initTarget(target);
		}

		for (let property of options.properties) {
			if (this.observed.has(target, property)) {
				continue;
			}

			this.observed.add(target, property);

			if (!this.observedProperties.has(property)) {
				this._initProperty(property);
			}

			this.oldValues.set(target, property, getComputedStyle(target).getPropertyValue(property));
		}

		this._updateTransition(target);
	}

	static _initProperty (property) {
		if (UNREGISTERED_TRANSITION_BUG) {
			gentleRegisterProperty(property);
		}

		this.observedProperties.add(property);
	}

	static _initTarget (target) {
		// TODO this will fail if the transition is modified after the fact
		let transition = getComputedStyle(target).transition;
		target.style.transition = transition + ", var(--style-observer-transition, all)";
		target.addEventListener("transitionstart", this.handleEvent);
	}

	static _updateTransition (target) {
		let allProperties = [...this.observed.get(target)];
		// Clear our own transition
		target.style.setProperty("--style-observer-transition", "");

		let transitionProperties = new Set(getComputedStyle(target).transitionProperty.split(", "));

		// Only add properties not already present
		let transition = allProperties
			.filter(property => !transitionProperties.has(property))
			.map(property => `${property} 1ms step-start allow-discrete`).join(", ");
		target.style.setProperty("--style-observer-transition", transition);
	}

	/**
	 * Stop observing a target for changes to one or more CSS properties.
	 * @param { Element } target
	 * @param { string | string[], {properties} } options
	 * @param { string[] } options.properties - The properties to unobserve. Leave blank to unobserve all properties.
	 * @void
	 */
	unobserve (target, options) {
		options = this.resolveOptions(options);

		let propertiesToRemove = options.properties ?? this.observed.get(target);

		if (propertiesToRemove) {
			this.observed.delete(target, ...propertiesToRemove);
		}
	}
}

function resolveOptions (options) {
	if (!options) {
		return {};
	}

	if (typeof options === "string") {
		options = { properties: [options] };
	}
	else if (Array.isArray(options)) {
		options = { properties: options };
	}

	return options;
}
