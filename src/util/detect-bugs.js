import TRANSITIONRUN_EVENT_LOOP from "./detect-bugs/transitionrun-loop.js";
import UNREGISTERED_TRANSITION from "./detect-bugs/unregistered-transition.js";
import ADOPTED_STYLE_SHEET from "./detect-bugs/adopted-style-sheet.js";

export const detectors = { TRANSITIONRUN_EVENT_LOOP, UNREGISTERED_TRANSITION, ADOPTED_STYLE_SHEET };

/**
 * Data structure for all detected bugs.
 * All bugs start off as true, and once their promises resolve, that is replaced with the actual value
 */
export const bugs = {
	detectAll () {
		return Promise.all(Object.values(detectors).map(detector => detector.valuePending));
	},
};

for (let bug in detectors) {
	let detector = detectors[bug];
	Object.defineProperty(bugs, bug, {
		get () {
			detector.valuePending.then(value => {
				delete this[bug];
				this[bug] = value;
			});

			// Until we know, assume the bug is present
			return true;
		},
		configurable: true,
		enumerable: true,
	});
}

export default bugs;
