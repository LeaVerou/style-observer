import StyleObserver from "../src/index.js";
import { delay } from "../src/util.js";

// Shared state
let dummy, observer, records = [];

export default {
	name: "Basic",

	beforeAll () {
		dummy = document.createElement("div");
		document.body.append(dummy);

		observer = new StyleObserver(recs => {
			records = recs;
		});
	},

	before () {
		let { property, initial } = this.data;

		if (initial) {
			dummy.style.setProperty(property, initial);
		}

		observer.observe(dummy, property);
	},

	async run (arg) {
		let property = this.data.property;

		dummy.style.setProperty(property, arg);

		// Wait for the observer to update the record
		await delay(100);

		// Find the record for the property
		let record = records.find(record => record.property === property);

		return record.value;
	},

	after () {
		observer.unobserve(dummy, this.data.property);
	},

	afterAll () {
		dummy.remove();
	},

	getName () {
		return this.data.property + ": " + (this.data.initial ?? "initial");
	},

	tests: [
		{
			data: {
				property: "width",
			},
			arg: "42px",
			expect: "42px",
		},
		{
			data: {
				property: "--color",
				initial: "transparent",
			},
			arg: "rebeccapurple",
			expect: "rebeccapurple",
		},
	],
};
