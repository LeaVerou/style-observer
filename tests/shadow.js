import StyleObserver from "../src/index.js";
import { delay } from "../src/util.js";

// Shared state
let host;

export default {
	name: "Shadow DOM",

	beforeAll () {
		host = document.createElement("dummy-element");
		host.attachShadow({ mode: "open" });
		host.shadowRoot.innerHTML = "";
		document.body.append(host);
	},

	beforeEach () {
		let dummy = document.createElement("div");
		host.shadowRoot.append(dummy);

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

	afterEach () {
		this.data.observer.unobserve(this.data.dummy);
		this.data.dummy.remove();
	},

	afterAll () {
		host.remove();
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
				property: "text-align",
				initial: "center",
			},
			arg: "right",
			expect: "right",
		},
		{
			data: {
				property: "opacity",
				initial: "0.5",
			},
			arg: "0",
			expect: "0",
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
