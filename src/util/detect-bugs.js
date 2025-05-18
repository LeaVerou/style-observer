import detectTransitionRunLoopBug from "./detect-bugs/transitionrun-loop.js";
import detectUnregisteredTransitionBug from "./detect-bugs/unregistered-transition.js";

// Cache for detection results
let transitionRunLoopPromise = null;
let unregisteredTransitionPromise = null;

const bugs = {
	/**
	 * Check if the browser is affected by the Safari transitionrun loop bug
	 * @returns {Promise<boolean>}
	 */
	async transitionRunLoop() {
		if (!transitionRunLoopPromise) {
			transitionRunLoopPromise = detectTransitionRunLoopBug();
		}
		return transitionRunLoopPromise;
	},

	/**
	 * Check if the browser is affected by the unregistered transition bug
	 * @returns {Promise<boolean>}
	 */
	async unregisteredTransition() {
		if (!unregisteredTransitionPromise) {
			unregisteredTransitionPromise = detectUnregisteredTransitionBug();
		}
		return unregisteredTransitionPromise;
	}
};

export default bugs;
