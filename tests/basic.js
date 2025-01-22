import StyleObserver from "../src/index.js";
import { delay } from "../src/util.js";

export default {
	name: "Basic",
	setup () {
		let dummy = document.createElement("div");
		document.body.append(dummy);

		let observer = new StyleObserver(records => {
			this.data.record = records[0];
		});

		let { property, initial } = this.data;
		if (initial) {
			dummy.style.setProperty(property, initial);
		}

		observer.observe(dummy, property);

		this.data.observer = observer;
		this.data.dummy = dummy;
	},

	async run (arg) {
		this.data.dummy.style.setProperty(this.data.property, arg);

		// Wait for the observer to update the record
		await delay(100);

		return this.data.record.value;
	},

	teardown () {
		this.data.observer.unobserve(this.data.dummy);
		this.data.dummy.remove();
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
