import StyleObserver from "../index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";

export default {
	name: "Multiple observers on the same target",

	beforeAll () {
		gentleRegisterProperty("--prop-registered", { syntax: "<percentage>", initialValue: "0%" });
	},

	beforeEach () {
		this.dummy = document.createElement("div");
		document.body.append(this.dummy);

		this.dummy.style.setProperty("--prop-not-registered", "foo");
	},

	run ({ props1, props2, property, value }) {
		let observer1, observer2, ret = [];

		let wait = props1.some(prop => props2.includes(prop));

		let callback = (records, resolve) => {
			ret.push(...records);
			if (wait) {
				if (ret.length === 2) {
					// We got records from both observers
					resolve(ret);
				}
			}
			else {
				resolve(ret);
			}
		};

		let promise1 = new Promise((resolve, reject) => {
			observer1 = new StyleObserver(records => callback(records, resolve), { target: this.dummy, properties: props1 });

			setTimeout(reject, 500, "First observer timed out");
		});

		let promise2 = new Promise((resolve, reject) => {
			observer2 = new StyleObserver(records => callback(records, resolve), { target: this.dummy, properties: props2 });

			setTimeout(reject, 500, "Second observer timed out");
		});

		this.dummy.style.setProperty(property, value);

		return Promise.race([promise1, promise2])
		.then(records => records.map(record => record.value))
		.catch(reason => reason)
		.finally(() => {
			observer1.unobserve();
			observer2.unobserve();
		});
	},

	afterEach () {
		this.dummy.remove();
	},

	tests: [
		{
			name: "Without properties overlap",
			tests: [
				{
					name: "Animatable built-in (from first observer)",
					arg: {
						props1: ["opacity", "text-align"],
						props2: ["padding", "background-color"],
						property: "opacity",
						value: "0.5",
					},
					expect: ["0.5"],
				},
				{
					name: "Discrete built-in (from second observer)",
					arg: {
						props1: ["padding", "background-color"],
						props2: ["opacity", "text-align"],
						property: "text-align",
						value: "center",
					},
					expect: ["center"],
				},
				{
					name: "Registered custom property (from first observer)",
					arg: {
						props1: ["--prop-registered", "text-align"],
						props2: ["padding", "background-color"],
						property: "--prop-registered",
						value: "50%",
					},
					expect: ["50%"],
				},
				{
					name: "Not registered custom property (from second observer)",
					arg: {
						props1: ["padding", "background-color"],
						props2: ["--prop-not-registered", "text-align"],
						property: "--prop-not-registered",
						value: "bar",
					},
					expect: ["bar"],
				}
			],
		},
		{
			name: "With properties overlap",
			tests: [
				{
					name: "Animatable built-in",
					arg: {
						props1: ["opacity", "text-align"],
						props2: ["opacity", "color"],
						property: "opacity",
						value: "0.5",
					},
					expect: ["0.5", "0.5"],
				},
				{
					name: "Discrete built-in",
					arg: {
						props1: ["text-align", "opacity"],
						props2: ["padding", "text-align"],
						property: "text-align",
						value: "right",
					},
					expect: ["right", "right"],
				},
				{
					name: "Registered custom property",
					arg: {
						props1: ["--prop-registered", "text-align"],
						props2: ["padding", "--prop-registered"],
						property: "--prop-registered",
						value: "50%",
					},
					expect: ["50%", "50%"],
				},
				{
					name: "Not registered custom property",
					arg: {
						props1: ["padding", "--prop-not-registered"],
						props2: ["text-align", "--prop-not-registered"],
						property: "--prop-not-registered",
						value: "baz",
					},
					expect: ["baz", "baz"],
				}
			],
		},
	],
};
