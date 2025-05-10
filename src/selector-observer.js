import { adoptCSS, unadoptCSS } from "./util/adopt-css.js";

/**
 * @typedef {Object} SelectorObserverOptions
 * @property {(Document | ShadowRoot)[]} [roots=[document]] - The roots to observe.
 * @property {boolean} [any] - Whether to fire the callback when any of the observed selectors are matched or when individual selectors are matched.
 */

export default class SelectorObserver {
	/**
	 * Map of root nodes to sheets
	 * @type {Map<Document | ShadowRoot, CSSStyleSheet>}
	 */
	#roots = new Map();

	#selectors = new Set();

	/**
	 * @param {Function} callback
	 * @param {SelectorObserverOptions} [options]
	 */
	constructor (callback, options = {}) {
		this.callback = callback;
		this.options = options;

		if (this.options.roots) {
			for (let root of this.options.roots) {
				this.observeRoot(root);
			}
		}
		else {
			this.observeRoot();
		}
	}

	/**
	 * Observe all selectors on a new root node.
	 */
	observeRoot (root = document) {
		if (this.#roots.has(root)) {
			return;
		}

		this.#roots.set(root, null);
		this.#updateCSS(root);

		root.addEventListener("transitionend", this, { capture: true });
		root.addEventListener("animationend", this, { capture: true });
	}

	handleEvent (event) {
		if (event.type === "transitionend") {
			console.log("transitionend", event.target);
			// this.callback(event.target);
		}
		else if (event.type === "animationend") {
			console.log("animationend", event.target);
			// this.callback(event.target);
		}
	}
	/**
	 * Stop observing all selectors on a root node.
	 */
	unobserveRoot (root = document) {
		if (!this.#roots.has(root)) {
			return;
		}

		this.#roots.delete(root);

		let sheet = this.#roots.get(root);

		if (sheet) {
			unadoptCSS(sheet, root);
		}
	}

	/**
	 * Observe a new selector on all roots.
	 */
	observe (selector, options) {
		let immediate = options?.immediate ?? this.options.immediate;

		if (immediate) {
			let records = [];
			for (let root of this.#roots.keys()) {
				for (let element of root.querySelectorAll(selector)) {
					let record = { root, element, selector, immediate: true };
					records.push(record);
				}
			}

			this.callback(records);
		}

		this.#selectors.add(selector);

		// Add selector to CSS
		for (let root of this.#roots.keys()) {
			this.#updateCSS(root);
		}
	}

	/**
	 * Stop observing a selector on all roots.
	 */
	unobserve (selector) {
		this.#selectors.delete(selector);

		// Remove selector from CSS
		for (let root of this.#roots.keys()) {
			this.#updateCSS(root);
		}
	}

	#updateCSS(root) {
		let selectorList = Array.from(this.#selectors).join(",");
		let css;

		if (this.options.any || true) {
			css = `
			@property --selector-observer-any {
				syntax: "<integer>";
				initial-value: 0;
				inherits: false;
			}

			@keyframes selector-observer-any {

			}

			${selectorList} {
				--selector-observer-any: 1;
				transition: --selector-observer-any 1ms step-start;
				animation: selector-observer-any 1ms step-end;

				@starting-style {
					--selector-observer-any: 0;
				}
			}`;
		}
		else {
			css = `
			${selectorList} {
				transition: var(--style-observer-transition);
			}
		`;
		}

		let sheet = this.#roots.get(root);

		if (sheet) {
			sheet.replaceSync(css);
		}
		else {
			sheet = adoptCSS(css, { root, isolated: true });
			this.#roots.set(root, sheet);
		}
	}

	disconnect () {}
}
