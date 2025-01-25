import StyleObserver from "../src/index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";
import tests from "./tests.js";

export default {
	name: "Shadow DOM",

	beforeEach () {
		let host = document.getElementById(this.data.hostId);
		let target = Object.assign(document.createElement("div"), { id: this.arg.property });
		host.shadowRoot.append(target);
	},

	async run ({property, meta, initial, value}) {
		let host = document.getElementById(this.data.hostId);
		let target = host.shadowRoot.getElementById(this.arg.property);

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

		let records = await new Promise(resolve => {
			let observer = new StyleObserver(records => {
				resolve(records);
			});

			observer.observe(target, property);

			target.style.setProperty(property, value);
		});

		return records[0].value;
	},

	afterEach () {
		let host = document.getElementById(this.data.hostId);
		let target = host.shadowRoot.getElementById(this.arg.property);
		target.remove();
	},

	tests: [
		{
			name: "Imperative",
			beforeAll () {
				let host = Object.assign(document.createElement("dummy-element"), { id: "imperative-host" });
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
			tests,
		},
		{
			name: "Declarative",
			data: {
				hostId: "declarative-host",
			},
			tests,
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
			tests,
		},
	],
};
