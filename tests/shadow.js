import StyleObserver from "../index.js";
import gentleRegisterProperty from "./util/gentle-register-property.js";
import tests from "./tests.js";
import bugs from "../src/util/bugs/index.js";

const inlineStyleTest = {
	name: "Don't use inline styles",
	skip: !document.adoptedStyleSheets || bugs.ADOPTED_STYLE_SHEET,
	async run ({property, meta, initial, value}) {
		// Make the property unique
		property += "-" + this.data.hostId;

		let host = document.getElementById(this.data.hostId);
		host.style.setProperty(property, initial);

		return new Promise((resolve, reject) => {
			let observer = new StyleObserver(records => {
				resolve("Observer fired");
			});

			observer.observe(host, property);

			requestAnimationFrame(() => {
				host.style.setProperty(property, value);
			});

			// Timeout after 500ms
			setTimeout(() => reject(), 500);
		})
		.catch(_ => "Observer did not fire")
		.then(result => {
			let inlineValue = host.style.getPropertyValue("--style-observer-transition");
			let adoptedValue = getComputedStyle(host).getPropertyValue("--style-observer-transition");

			return { result, inlineValue, adoptedValue };
		});
	},
	map (value) {
		let { result, inlineValue, adoptedValue } = value;
		inlineValue = inlineValue.length === 0 || inlineValue === "Empty";
		adoptedValue = adoptedValue.length > 0;

		return { result, inlineValue, adoptedValue };
	},
	arg: {
		property: "--test-inline-style",
		initial: "foo",
		value: "bar",
	},
	expect: {
		result: "Observer fired",
		inlineValue: "Empty",
		adoptedValue: "Not empty",
	},
};

export default {
	name: "Shadow DOM",

	beforeEach () {
		let host = document.getElementById(this.data.hostId);
		let id = this.arg.property + "-" + CSS.escape(this.arg.value);
		let target = Object.assign(document.createElement("div"), { id });
		host.shadowRoot.append(target);
	},

	run ({property, meta, initial, value}) {
		let host = document.getElementById(this.data.hostId);
		let id = property + "-" + CSS.escape(value);
		let target = host.shadowRoot.getElementById(id);

		if (property.startsWith("--")) {
			// Make custom properties unique across all tests
			property += "-" + this.data.hostId;
		}

		if (meta) {
			gentleRegisterProperty(property, meta);
		}

		if (initial !== undefined) {
			target.style.setProperty(property, initial);
		}

		return new Promise((resolve, reject) => {
			let observer = new StyleObserver(records => {
				resolve(records);
			});

			observer.observe(target, property);

			target.style.setProperty(property, value);

			// Timeout after 500ms
			setTimeout(() => reject(), 500);
		})
		.catch(_ => {
			return [{ value: "Timed out" }];
		})
		.then(records => records[0].value);
	},

	afterEach () {
		let host = document.getElementById(this.data.hostId);
		let id = this.arg.property + "-" + CSS.escape(this.arg.value);
		let target = host.shadowRoot.getElementById(id);
		target.remove();
	},

	tests: [
		{
			name: "Imperative",
			beforeAll () {
				let host = Object.assign(document.createElement("div"), { id: "imperative-host" });
				host.attachShadow({ mode: "open" });
				host.shadowRoot.innerHTML = "";
				document.body.append(host);
			},
			afterAll () {
				document.getElementById("imperative-host").remove();
			},
			data: {
				hostId: "imperative-host",
			},
			tests: [
				...tests,
				inlineStyleTest,
			],
		},
		{
			name: "Declarative",
			skip: document.getElementById("declarative-host").shadowRoot === null,
			data: {
				hostId: "declarative-host",
			},
			tests: [
				...tests,
				inlineStyleTest,
			],
		},
		{
			name: "Registered custom element",
			async beforeAll () {
				class RegisteredComponent extends HTMLElement {
					constructor () {
						super();
						this.attachShadow({ mode: "open" });
					}

					connectedCallback () {
						this.setAttribute("id", "registered-host");
					}
				}

				customElements.define("registered-component", RegisteredComponent);
			},
			data: {
				hostId: "registered-host",
			},
			tests: [
				...tests,
				inlineStyleTest,
			],
		},
	],
};
