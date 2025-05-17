import detectTransitionRunLoopBug from "./detect-bugs/transitionrun-loop.js";
import detectUnregisteredTransitionBug from "./detect-bugs/unregistered-transition.js";

// Cache for detection results
let transitionRunLoopPromise = null;
let unregisteredTransitionPromise = null;

/**
 * Check if the browser is affected by the Safari transitionrun loop bug
 * @returns {Promise<boolean>}
 */
export function hasTransitionRunLoopBug() {
	if (!transitionRunLoopPromise) {
		transitionRunLoopPromise = detectTransitionRunLoopBug();
	}
	return transitionRunLoopPromise;
}

/**
 * Check if the browser is affected by the unregistered transition bug
 * @returns {Promise<boolean>}
 */
export function hasUnregisteredTransitionBug() {
	if (!unregisteredTransitionPromise) {
		unregisteredTransitionPromise = detectUnregisteredTransitionBug();
	}
	return unregisteredTransitionPromise;
}

export { detectTransitionRunLoopBug, detectUnregisteredTransitionBug };
