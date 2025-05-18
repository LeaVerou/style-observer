import detectTransitionRunLoopBug from "./detect-bugs/transitionrun-loop.js";
import detectUnregisteredTransitionBug from "./detect-bugs/unregistered-transition.js";

class Bugs {
	/**
	 * Whether the browser has the transition run loop bug
	 * @type {boolean | null}
	 * @private
	 */
	static #transitionRunLoop = null;

	/**
	 * Whether the browser has the unregistered transition bug
	 * @type {boolean | null}
	 * @private
	 */
	static #unregisteredTransition = null;

	/**
	 * Whether the browser has the transition run loop bug
	 * @type {boolean}
	 */
	static get transitionRunLoop () {
		if (this.#transitionRunLoop === null) {
			this.#transitionRunLoop = false; // Default to false while detecting
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
			this.#unregisteredTransition = false; // Default to false while detecting
			detectUnregisteredTransitionBug().then(result => {
				this.#unregisteredTransition = result;
			});
		}
		return this.#unregisteredTransition;
	}

	/**
	 * Detect all bugs in parallel
	 * @returns {Promise<void>}
	 */
	static async detectAll () {
		const [transitionRunLoop, unregisteredTransition] = await Promise.all([
			detectTransitionRunLoopBug(),
			detectUnregisteredTransitionBug(),
		]);

		this.#transitionRunLoop = transitionRunLoop;
		this.#unregisteredTransition = unregisteredTransition;
	}
}

export default Bugs;
