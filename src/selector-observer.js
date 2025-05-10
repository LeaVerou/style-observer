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
		let { target } = event;
		if (event.type === "transitionend") {
			let selector = decode(event.propertyName.replace(/^--selector-observer-selector-/, ""));

			console.log("transitionend", event.target, selector);
			// this.callback(event.target);
		}
		else if (event.type === "animationend") {
			let selector = decode(event.animationName.replace(/^selector-observer-/, ""));
			console.log("animationend", event.target, selector);
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
				for (let target of root.querySelectorAll(selector)) {
					let record = { root, target, selector, immediate: true };
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
		if (this.#selectors.size === 0 && !this.#roots.get(root)) {
			return;
		}

		let selectorList = Array.from(this.#selectors);
		let ids = this.options.any ? ["any"] : selectorList.map(selector => encode(selector));

		let animationNames = ids.map(id => "selector-observer-" + id);
		let transitionProperties = ids.map(id => "--selector-observer-selector-" + id);

		let css = `
		${transitionProperties
			.map(
				property => `@property ${property} {
			syntax: "<integer>";
			initial-value: 0;
			inherits: false;
		}`,
			)
			.join("\n")}

		${animationNames.map(animationName => `@keyframes ${animationName} {}`).join("\n")}

		${selectorList.join(", ")} {
			${transitionProperties.map(property => `${property}: 1`).join(";\n")};
			--selector-observer-animation: ${ids.map(id => `var(--selector-observer-animation-${id}, selector-observer-animation-noop)`).join(" ")};
			--selector-observer-transition: ${transitionProperties.map(property => `${property} 1ms step-start`).join(",")};
			transition: var(--selector-observer-transition), var(--style-observer-transition, --style-observer-noop);
			animation: var(--selector-observer-animation);

			@starting-style {
				${transitionProperties.map(property => `${property}: 0`).join(";\n")}
			}
		}

		${selectorList
			.map(
				(selector, index) => `${selector} {
			${transitionProperties[index]}: 1;
			--selector-observer-animation-${ids[index]}: ${animationNames[index]} 1ms step-end, ;
		}`,
			)
			.join("\n")}
		`;

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

export function encode (str) {
	let utf8 = new TextEncoder().encode(str);
	let bin = "";
	for (let byte of utf8) bin += String.fromCharCode(byte);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decode (encoded) {
	let pad = encoded.length % 4;
	if (pad) encoded += "=".repeat(4 - pad);
	let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
	let binary = atob(base64);
	let bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}
