import StyleObserver from "../src/index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";

export default {
	name: "Shadow DOM",
	tests: [
		{
			name: "Imperative",
			beforeAll () {
				let host = Object.assign(document.createElement("dummy-element"), { id: "imperative-host" });
				host.attachShadow({ mode: "open" });
				host.shadowRoot.innerHTML = "";
				document.body.append(host);
			},
			beforeEach () {
				let host = document.getElementById("imperative-host");
				let target = Object.assign(document.createElement("div"), { id: this.arg.property });
				host.shadowRoot.append(target);
			},
			async run ({property, meta, initial, value}) {
				let host = document.getElementById("imperative-host");
				let target = host.shadowRoot.getElementById(this.arg.property);

				if (meta) {
					gentleRegisterProperty(property, meta);
				}

				if (initial) {
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
				let host = document.getElementById("imperative-host");
				let target = host.shadowRoot.getElementById(this.arg.property);
				target.remove();
			},
			afterAll () {
				document.getElementById("imperative-host").remove();
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
	],
};
