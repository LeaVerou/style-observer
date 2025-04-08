import TRANSITIONRUN_EVENT_LOOP_BUG from "./detect-bugs/transitionrun-loop.js";
import UNREGISTERED_TRANSITION_BUG from "./detect-bugs/unregistered-transition.js";

/**
 * Data structure for all detected bugs.
 * All bugs start off as true, and once their promises resolve, that is replaced with the actual value
 */
const bugs = {
	TRANSITIONRUN_EVENT_LOOP: true,
	UNREGISTERED_TRANSITION: true,
};

export default bugs;

TRANSITIONRUN_EVENT_LOOP_BUG.then(value => {
	bugs.TRANSITIONRUN_EVENT_LOOP = value;
});

UNREGISTERED_TRANSITION_BUG.then(value => {
	bugs.UNREGISTERED_TRANSITION = value;
});
