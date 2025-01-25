import StyleObserver from "../src/index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";

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
			tests: [
				{
					name: "Interpolable built-in",
					arg: {
						property: "opacity",
						value: "0.5",
					},
					expect: "0.5",
				},
				{
					name: "Discrete built-in",
					arg: {
						property: "display",
						value: "flex",
					},
					expect: "flex",
				},
				{
					name: "Unregistered custom property",
					arg: {
						property: "--unregistered",
						initial: "bar",
						value: "foo",
					},
					expect: "foo",
				},
				{
					name: "Registered custom property",
					arg: {
						property: "--registered",
						meta: {
							syntax: "<color>",
							initialValue: "transparent",
						},
						initial: "red",
						value: "green",
					},
					expect: "green",
				},
			],
		},
		{
			name: "Declarative",
			data: {
				hostId: "declarative-host",
			},
			tests: [
				{
					name: "Interpolable built-in",
					arg: {
						property: "color",
						value: "red",
					},
					expect: "rgb(255, 0, 0)",
				},
				{
					name: "Discrete built-in",
					arg: {
						property: "display",
						initial: "flex",
						value: "grid",
					},
					expect: "grid",
				},
				{
					name: "Unregistered custom property",
					arg: {
						property: "--declarative-unregistered",
						initial: 0,
						value: 1,
					},
					expect: "1",
				},
				{
					name: "Registered custom property",
					arg: {
						property: "--declarative-registered",
						meta: {
							syntax: "<angle>",
							initialValue: "45deg",
						},
						initial: "0deg",
						value: "1turn",
					},
					expect: "1turn",
				},
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
				{
					name: "Interpolable built-in",
					arg: {
						property: "font-size",
						value: "10px",
					},
					expect: "10px",
				},
				{
					name: "Discrete built-in",
					arg: {
						property: "display",
						initial: "table-cell",
						value: "inline-block",
					},
					expect: "inline-block",
				},
				{
					name: "Unregistered custom property",
					arg: {
						property: "--custom-element-unregistered",
						initial: 0,
						value: "foo",
					},
					expect: "foo",
				},
				{
					name: "Registered custom property",
					arg: {
						property: "--custom-element-registered",
						meta: {
							syntax: "<length>",
							initialValue: "0px",
						},
						initial: "1px",
						value: "2px",
					},
					expect: "2px",
				},
			],
		},
	],
};
