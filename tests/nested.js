import StyleObserver from "../index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";

let tests = [
	{
		name: "Inherited interpolable built-in",
		arg: {
			property: "color",
			value: "green",
		},
		expect: "rgb(0, 128, 0)",
	},
	{
		name: "Non-inherited interpolable built-in",
		arg: {
			property: "opacity",
			value: "0.5",
		},
		expect: "No change",
	},
	{
		name: "Inherited discrete built-in",
		arg: {
			property: "text-align",
			value: "right",
		},
		expect: "right",
	},
	{
		name: "Non-inherited discrete built-in",
		arg: {
			property: "position",
			value: "relative",
		},
		expect: "No change",
	},
	{
		name: "Unregistered (non-inherited) custom property",
		arg: {
			property: "--unregistered",
			initial: "foo",
			value: "bar",
		},
		expect: "bar",
	},
	{
		name: "Registered inherited custom property",
		arg: {
			property: "--registered-inherited",
			meta: {
				syntax: "<color>",
				initialValue: "transparent",
			},
			value: "blue",
		},
		expect: "rgb(0, 0, 255)",
	},
	{
		name: "Registered non-inherited custom property",
		arg: {
			property: "--registered-non-inherited",
			meta: {
				syntax: "<color>",
				initialValue: "transparent",
				inherits: false,
			},
			value: "salmon",
		},
		expect: "No change",
	},
];

export default {
	name: "Nested targets",

	beforeEach () {
		let parent = document.createElement("div");
		let child = document.createElement("div");
		parent.append(child);

		document.body.append(parent);
		this.data.parent = parent;

		if (this.arg.meta) {
			gentleRegisterProperty(this.arg.property, this.arg.meta);
		}
	},

	run ({property, value, initial}) {
		let parent = this.data.parent;
		let child = parent.children[0];

		if (initial) {
			if (this.data.onChild) {
				child.style.setProperty(property, initial);
			}
			else {
				parent.style.setProperty(property, initial);
			}
		}

		let targets = [child];
		if (this.data.both) {
			targets.push(parent);
		}

		let observer;
		let ret = [];
		return new Promise((resolve, reject) => {
			observer = new StyleObserver(records => {
				ret.push(...records);

				if (!this.data.both) {
					// If we only observe the child, we can resolve immediately
					resolve(ret);
				}

				if (ret.length === 2) {
					// We need both records: for the parent and child
					resolve(ret);
				}
			}, { targets, properties: [property] });

			if (this.data.onChild) {
				child.style.setProperty(property, value);
			}
			else {
				parent.style.setProperty(property, value);
			}

			// Timeout after 500ms
			// Since we set the property on the parent,
			// we might get no records (if we observe the child only and the property is not inherited)
			// or one record (if we observe the parent and child, and the property is not inherited)
			setTimeout(() => reject(ret), 500);
		})
		.then(records => {
			if (this.data.both) {
				return records.map(record => record.value);
			}
			return records[0].value;
		})
		.catch(records => {
			if (records.length > 0) {
				if (this.data.onChild) {
					return ["No change", records[0].value];
				}
				return [records[0].value, "No change"];
			}
			else {
				return "No change";
			}
		})
		.finally(() => observer.unobserve());
	},

	afterEach () {
		this.data.parent.remove();
	},

	tests: [
		{
			name: "Observe child",
			tests
		},
		{
			name: "Observe parent and child",
			data: {
				both: true,
			},
			check (actual, expected) {
				if (!Array.isArray(actual)) {
					// If we have no records, we might have timed out (e.g., in Firefox, observing the display property)
					return false;
				}

				// Non-inherited property is set on the parent
				if (actual[1] === "No change") {
					return expected === "No change";
				}

				// Property is set on the child
				if (actual[0] === "No change") {
					return this.parent.check(actual, expected);
				}

				// Inherited property is set on the parent
				return actual.every(value => value === expected);
			},
			tests: [
				...tests,
				{
					name: "Set built-in on the child",
					data: {
						onChild: true,
					},
					arg: {
						property: "color",
						value: "red",
					},
					expect: ["No change", "rgb(255, 0, 0)"],
				},
				{
					name: "Set custom property on the child",
					data: {
						onChild: true,
					},
					arg: {
						property: "--registered-inherited",
						value: "#f06",
					},
					expect: ["No change", "rgb(255, 0, 102)"],
				},
			],
		},
	],
};
