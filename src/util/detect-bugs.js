import detectTransitionRunLoopBug from "./detect-bugs/transitionrun-loop.js";
import detectUnregisteredTransitionBug from "./detect-bugs/unregistered-transition.js";

export default class Bugs {
	/**
	 * Whether the browser has the transition run loop bug
	 * @type {boolean | null}
	 */
	static #transitionRunLoop = null;

	/**
	 * Whether the browser has the unregistered transition bug
	 * @type {boolean | null}
	 */
	static #unregisteredTransition = null;

	/**
	 * Detect all bugs in parallel
	 * @returns {Promise<{ transitionRunLoop: boolean, unregisteredTransition: boolean }>}
	 */
	static async detect () {
		const [transitionRunLoop, unregisteredTransition] = await Promise.all([
			detectTransitionRunLoopBug(),
			detectUnregisteredTransitionBug(),
		]);

		this.#transitionRunLoop = transitionRunLoop;
		this.#unregisteredTransition = unregisteredTransition;

		return {
			transitionRunLoop,
			unregisteredTransition,
		};
	}

	/**
	 * Whether the browser has the transition run loop bug
	 * @type {boolean}
	 */
	static get transitionRunLoop () {
		if (this.#transitionRunLoop === null) {
			this.#transitionRunLoop = true; // Default to true while detecting, just in case
			detectTransitionRunLoopBug().then(result => {
				this.#transitionRunLoop = result;
			});
		}
		return this.#transitionRunLoop;
	}

	/**
	 * Whether the browser has the unregistered transition bug
	 * @type {boolean}
	 */
	static get unregisteredTransition () {
		if (this.#unregisteredTransition === null) {
			this.#unregisteredTransition = true; // Default to true while detecting, just in case
			detectUnregisteredTransitionBug().then(result => {
				this.#unregisteredTransition = result;
			});
		}
		return this.#unregisteredTransition;
	}
}
