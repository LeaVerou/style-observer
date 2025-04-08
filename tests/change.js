import StyleObserver from "../index.js";
import gentleRegisterProperty from "./util/gentle-register-property.js";
import adoptCss from "../src/util/adopt-css.js";


export default {
	name: "Different ways to change a property",

	beforeAll () {
		gentleRegisterProperty("--registered", { syntax: "<angle>", initialValue: "0deg" });
		gentleRegisterProperty("--registered-non-inherited", { syntax: "<color>", initialValue: "black", inherits: false });

		adoptCss(`
			[class$="-pseudo"] {
				color: transparent;
			}
		`);
	},

	run (property, value) {
		let child = this.container.children[0];
		let target = child ?? this.container;

		let observer;
		return new Promise((resolve, reject) => {
			observer = new StyleObserver(records => {
				resolve(records);
			}, { target, properties: [property] });

			requestAnimationFrame(() => {
				if (child) {
					property = this.data.property ?? property;
					value = this.data.value ?? value;

					this.container.style.setProperty(property, value);
				}
				else {
					// Pseudo-class tests
					target.innerHTML = "";
				}
			});

			// Timeout after 500ms
			setTimeout(() => reject(), 500);
		})
		.then(records => records[0].value)
		.catch(() => "No change")
		.finally(() => {
			observer.unobserve();
		});
	},

	afterEach () {
		this.container.remove();
	},

	tests: [
		{
			name: "Inheritance",

			beforeEach () {
				let [property, value, initial] = this.args;

				this.container = document.createElement("div")
				this.container.append(document.createElement("div"));

				if (initial !== undefined) {
					this.container.style.setProperty(property, initial);
				}

				document.body.append(this.container);
			},

			tests: [
				{
					name: "Inherited animatable built-in",
					args: ["color", "rgb(128, 128, 128)"],
					expect: "rgb(128, 128, 128)",
				},
				{
					name: "Non-inherited animatable built-in",
					args: ["opacity", "0.5"],
					expect: "No change",
				},
				{
					name: "Inherited discrete built-in",
					args: ["font-family", "monospace", "serif"],
					expect: "monospace",
				},
				{
					name: "Non-inherited discrete built-in",
					args: ["position", "fixed", "relative"],
					expect: "No change",
				},
				{
					name: "Not registered (inherited) custom property",
					args: ["--not-registered", "baz", "bar"],
					expect: "baz",
				},
				{
					name: "Non-inherited registered custom property",
					args: ["--registered-non-inherited", "transparent"],
					expect: "No change",
				},
				{
					name: "Inherited registered custom property",
					args: ["--registered", "0.5turn", "42deg"],
					expect: "180deg",
				},
			],
		},
		{
			name: "Pseudo-class",

			beforeEach () {
				let [property, css] = this.args;
				let className = property.replace(/^--/, "") + "-pseudo";

				adoptCss(css);

				this.container = Object.assign(document.createElement("div"), { textContent: "foo", className });
				document.body.append(this.container);
			},

			tests: [
				{
					name: "Animatable built-in",
					args: [
						"opacity",
						`.opacity-pseudo:empty {
							opacity: 0.5;
						}
						`,
					],
					expect: "0.5",
				},
				{
					name: "Discrete built-in",
					args: [
						"position",
						`.position-pseudo:empty {
							position: fixed;
						}`,
					],
					expect: "fixed",
				},
				{
					name: "Not registered custom property",
					args: [
						"--custom",
						`.custom-pseudo {
							--custom: 0;

							&:empty {
								--custom: foo;
							}
						}`,
					],
					expect: "foo",
				},
				{
					name: "Registered custom property",
					args: [
						"--registered",
						`.registered-pseudo {
							--registered: 42deg;

							&:empty {
								--registered: 1turn;
							}
						}`,
					],
					expect: "360deg",
				},
			],
		},
		{
			name: "Media query",

			beforeEach () {
				let [property, css, mediaQuery] = this.args;
				let className = property.replace(/^--/, "") + "-media";

				if (!mediaQuery) {
					mediaQuery = css;
				}
				else {
					adoptCss(css);
				}

				this.container = Object.assign(document.createElement("div"), { className });
				document.body.append(this.container);

				// We don't want the media query to kick in immediately;
				// the style observer should be created first.
				setTimeout(()=> adoptCss(mediaQuery), 100);
			},

			tests: [
				{
					name: "Animatable built-in",
					args: [
						"opacity",
						`@media (min-width: 10px) {
							.opacity-media {
								opacity: 0.5;
							}
						}`,
					],
					expect: "0.5",
				},
				{
					name: "Discrete built-in",
					args: [
						"position",
						`@media (min-width: 10px) {
							.position-media {
								position: fixed;
							}
						}`,
					],
					expect: "fixed",
				},
				{
					name: "Not registered custom property",
					args: [
						"--custom",
						`.custom-media {
							--custom: 0;
						}`,
						`@media (min-width: 10px) {
							.custom-media {
								--custom: foo;
							}
						}`,
					],
					expect: "foo",
				},
				{
					name: "Registered custom property",
					args: [
						"--registered",
						`.registered-media {
							--registered: 42deg;
						}`,
						`@media (min-width: 10px) {
							.registered-media {
								--registered: 1turn;
							}
						}`,
					],
					expect: "360deg",
				},
			],
		},
		{
			name: "Container query",

			data: {
				property: "width",
				value: "5px",
			},

			beforeEach () {
				let [property, css] = this.args;

				let className = property.replace(/^--/, "") + "-container";
				adoptCss(css);

				this.container = Object.assign(document.createElement("div"), { className });
				this.container.append(document.createElement("div"));
				document.body.append(this.container);
			},

			tests: [
				{
					name: "Animatable built-in",
					args: [
						"opacity",
						`.opacity-container {
							container-type: inline-size;
						}

						@container (width < 10px) {
							.opacity-container > div {
								opacity: 0.5;
							}
						}`,
					],
					expect: "0.5",
				},
				{
					name: "Discrete built-in",
					args: [
						"text-align",
						`.text-align-container {
							container-type: inline-size;
						}

						@container (width < 10px) {
							.text-align-container > div {
								text-align: center;
							}
						}`,
					],
					expect: "center",
				},
				{
					name: "Not registered custom property",
					args: [
						"--custom",
						`.custom-container {
							--custom: 0;
							container-type: inline-size;
						}

						@container (width < 10px) {
							.custom-container > div {
								--custom: 42;
							}
						}`,
					],
					expect: "42",
				},
				{
					name: "Registered custom property",
					args: [
						"--registered",
						`.registered-container {
							--registered: 42deg;
							container-type: inline-size;
						}

						@container (width < 10px) {
							.registered-container > div {
								--registered: 1turn;
							}
						}`,
					],
					expect: "360deg",
				},
			],
		},
	],
};
