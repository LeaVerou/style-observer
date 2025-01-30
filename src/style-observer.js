import ElementStyleObserver, {resolveOptions} from "./element-style-observer.js";
import { toArray } from "./util.js";

/**
 * @typedef { Object } StyleObserverOptions
 * @property {string | string[]} [properties] - The properties to observe.
 * @property {Element | Element[]} [targets] - The elements to observe.
 */

export default class StyleObserver {
	/**
	 * @type { WeakMap<Element, ElementStyleObserver> }
	 */
	elementObservers = new WeakMap();

	/**
	 * @param {function} callback
	 * @param {StyleObserverOptions | string | string[]} options
	 */
	constructor (callback, options) {
		this.callback = callback;

		options = resolveOptions(options);
		options.targets ??= [];

		if (options.target) {
			options.targets.push(options.target);
		}

		this.options = options;

		if (this.options.targets.length > 0 && this.options.properties.length > 0) {
			this.observe(this.options.targets, this.options.properties);
		}
	}

	changed (records) {
		// TODO throttle & combine records
		this.callback(records);
	}

	/**
	 * Observe one or more targets for changes to one or more CSS properties
	 * @param {Element | Element[]} targets
	 * @param {string | string[]} properties
	 *
	 * @overload
	 * @param {string | string[]} properties
	 * @param {Element | Element[]} targets

	 * @return {void}
	 */
	observe (...args) {
		let {targets, properties} = resolveArgs(...args);

		if (targets.length === 0) {
			// Default to constructor-specified targets
			targets = this.options.targets;
		}

		if (targets.length === 0) {
			return;
		}

		for (let target of targets) {
			let observer = this.elementObservers.get(target);

			if (!observer) {
				observer = new ElementStyleObserver(target, records => this.changed(records), this.options);
				this.elementObservers.set(target, observer);
			}

			observer.observe(properties);
		}
	}

	/**
	 * Stop observing one or more targets for changes to one or more CSS properties.
	 * @param {Element | Element[]} targets
	 * @param {string | string[]} properties
	 *
	 * @overload
	 * @param {string | string[]} properties
	 * @param {Element | Element[]} targets
	 * @return {void}
	 */
	unobserve (...args) {
		let {targets, properties} = resolveArgs(...args);

		if (targets.length === 0) {
			// Default to constructor-specified targets
			targets = this.options.targets;
		}

		if (targets.length === 0) {
			return;
		}

		if (properties.length === 0) {
			// Default to constructor-specified properties
			properties = this.options.properties;
		}

		for (let target of targets) {
			let observer = this.elementObservers.get(target);

			if (observer) {
				observer.unobserve(properties);
			}
		}
	}

	updateTransition (targets) {
		for (let target of toArray(targets)) {
			let observer = this.elementObservers.get(target);

			if (observer) {
				observer.updateTransition();
			}
		}
	}
}

function resolveArgs (targets, properties) {
	let args = [...toArray(targets), ...toArray(properties)];
	targets = [];
	properties = [];

	for (let arg of args) {
		let arr = typeof arg === "string" || arg instanceof String ? properties : targets;
		arr.push(arg);
	}

	return { targets, properties };
}
