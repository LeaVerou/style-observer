import getTimesFor from "./utilities/getTimesFor.js";
import splitCommas from "./utilities/splitCommas.js";
import isRegisteredProperty from "./utilities/isRegisteredProperty.js";

export default {
	name: "Utility functions",
	getName () {
		if (this.level === 1) {
			return this.run.name + "()";
		}
		else {
			// Use first arg for level 2 tests with no name
			return this.args[0];
		}
	},
	tests: [getTimesFor, splitCommas, isRegisteredProperty],
};
