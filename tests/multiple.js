import StyleObserver from "../src/index.js";
import { delay } from "../src/util.js";

// Shared state
let dummy;
let observers = {
	1: null,
	2: null,
};
let records = {
	1: [],
	2: [],
};

export default {
	name: "Multiple observers",

	beforeAll () {
		dummy = document.createElement("div");
		document.body.append(dummy);

		observers[1] = new StyleObserver(recs => {
			records[1] = recs;
		}, { target: dummy });

		observers[2] = new StyleObserver(recs => {
			records[2] = recs;
		}, { target: dummy });
	},

	beforeEach () {
		let { property, initial } = this.data;

		if (initial) {
			dummy.style.setProperty(property, initial);
		}

		observers[this.args[0]].observe(property);
	},

	async run (observer, value) {
		let property = this.data.property;

		dummy.style.setProperty(property, value);

		// Wait for the observer to update the record
		await delay(100);

		// Find the record for the property
		let record = records[observer].find(record => record.property === property);

		return record.value;
	},

	afterEach () {
		observers[this.args[0]].unobserve(dummy, this.data.property);
	},

	afterAll () {
		dummy.remove();
	},

	getName () {
		return this.data.property + ": " + (this.data.initial ?? "initial") + " (observer " + this.args[0] + ")";
	},

	tests: [
		{
			data: {
				property: "width",
			},
			args: [1, "42px"],
			expect: "42px",
		},
		{
			data: {
				property: "--color",
				initial: "transparent",
			},
			args: [2, "rebeccapurple"],
			expect: "rebeccapurple",
		},
	],
};
