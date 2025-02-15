import StyleObserver from "../index.js";
import gentleRegisterProperty from "./util/gentle-register-property.js";
import types from "./util/types.js";

export default {
	name: "Basic",

	beforeEach () {
		let element = document.createElement("div");
		document.body.append(element);

		let result = {};
		result.promise = new Promise((resolve, reject) => {
			result.resolve = resolve;
			result.reject = reject;
		});

		let observer = new StyleObserver(records => {
			let value = records[0].value;
			result.resolve(value);
		});

		Object.assign(this.data, { element, observer, result });
	},

	run (property, initialValue, value) {
		let { observer, element, result } = this.data;

		element.style.setProperty(property, initialValue);
		observer.observe(element, property);
		element.style.setProperty(property, value);

		setTimeout(() => result.reject("Timeout"), 500);

		return result.promise;
	},

	afterEach () {
		this.data.observer.unobserve(this.data.element);
		this.data.element.remove();
	},

	tests: [
		{
			name: "Built-in properties",
			tests: Object.entries(types).map(([id, meta]) => {
				return {
					args: [meta.property, meta.values[0], meta.initialValue],
					expect: meta.values[0],
				};
			}),
		},
		{
			name: "Registered custom properties",
			getName () {
				return this.data.syntax;
			},
			tests: Object.entries(types).map(([id, meta]) => {
				return {
					beforeEach () {
						let definition = {
							name: `--registered-${meta.id}`,
							syntax: meta.syntax,
							initialValue: meta.initialValue,
						};
						try {
							gentleRegisterProperty(`--registered-${meta.id}`, meta);
						}
						catch (e) {
							// Unsupported syntax?
							console.log(e, definition);
							this.skip = true;
						}

						// FIXME Why did I need two .parent here?
						// Also, should I need to do this in the first place?
						// I had expected this would automatically run the parent's beforeEach as well
						// But maybe that's not a good idea, because then how would you override?
						this.parent.parent.beforeEach.call(this);
					},
					data: meta,
					args: [meta.property, meta.values[0], meta.initialValue],
					expect: meta.values[0],
				};
			}),
		},
		{
			name: "Unregistered custom properties",
			args: ["--not-registered", "0", "1"],
			expect: "1",
		},
	],
};
