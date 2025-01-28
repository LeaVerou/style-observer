import StyleObserver from "../index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";
import adoptCss from "../src/util/adopt-css.js";
import commonTests from "./tests.js";

let tests = [
	{
		name: "Inherited interpolable built-in",
		arg: {
			property: "color",
			value: "rgb(128, 128, 128)",
		},
		expect: "rgb(128, 128, 128)",
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
			property: "font-family",
			initial: "serif",
			value: "monospace",
		},
		expect: "monospace",
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
		name: "Not registered (inherited) custom property",
		arg: {
			property: "--not-registered",
			initial: "bar",
			value: "baz",
		},
		expect: "baz",
	},
	{
		name: "Non-inherited registered custom property",
		arg: {
			property: "--registered-non-inherited",
			meta: {
				syntax: "<color>",
				inherits: false,
				initialValue: "black",
			},
			value: "transparent",
		},
		expect: "No change",
	},
	{
		name: "Inherited registered custom property",
		arg: {
			property: "--registered",
			initial: "42deg",
			value: "0.5turn",
		},
		expect: "180deg",
	},
];

export default {
	name: "Different ways to change a property",

	beforeAll () {
		gentleRegisterProperty("--registered", { syntax: "<angle>", initialValue: "0deg" });

		adoptCss(`
			[data-test$="-pseudo"] {
				color: transparent;
			}
		`);
	},

	run ({ property, value }) {
		let child = this.container.children[0];
		let target = child ?? this.container;

		let observer;
		return new Promise((resolve, reject) => {
			observer = new StyleObserver(records => {
				resolve(records);
			}, { target, properties: [property] });

			if (child) {
				property = this.data.property ?? property;
				value = this.data.value ?? value;

				this.container.style.setProperty(property, value);
			}
			else {
				// Pseudo-class tests
				target.innerHTML = "";
			}

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
				let { property, meta, initial } = this.arg;

				this.container = document.createElement("div")
				this.container.append(document.createElement("div"));

				if (meta) {
					gentleRegisterProperty(property, meta);
				}
				
				if (initial !== undefined) {
					this.container.style.setProperty(property, initial);
				}

				document.body.append(this.container);
			},

			tests,
		},
		{
			name: "Pseudo-class",

			beforeEach () {
				let { property, value, initial } = this.arg;

				adoptCss(`
					[data-test="${ property }-pseudo"] {
						${ initial !== undefined ? `${ property }: ${ initial };` : "" }
					}

					[data-test="${ property }-pseudo"]:empty {
						${ property }: ${ value };
					}
				`);

				this.container = Object.assign(document.createElement("div"), { textContent: "foo" });
				this.container.dataset.test = `${ property }-pseudo`;

				document.body.append(this.container);
			},

			tests: commonTests,
		},
		{
			name: "Media query",

			beforeEach () {
				let { property, initial, value } = this.arg;

				this.container = document.createElement("div");
				this.container.dataset.test = `${ property }-media`;
				document.body.append(this.container);

				adoptCss(`
					[data-test="${ property }-media"] {
						${ initial !== undefined ? `${ property }: ${ initial };` : "" }
					}
				`);

				// We don't want the media query to kick in immediately;
				// the style observer should be created first.
				setTimeout(()=> {
					adoptCss(`
						@media (min-width: 10px) {
							[data-test="${ property }-media"] {
								${ property }: ${ value };
							}
						}
					`);
				}, 100);
			},

			tests: commonTests,
		},
		{
			name: "Container query",

			data: {
				property: "width",
				value: "5px",
			},

			beforeEach () {
				let { property, initial, value } = this.arg;

				adoptCss(`
					[data-test="${ property }-container"] {
						container-type: inline-size;

						> div {
							${ initial !== undefined ? `${ property }: ${ initial };` : "" }
						}
					}

					@container (width < 10px) {
						[data-test="${ property }-container"] > div {
							${ property }: ${ value };
						}
					}
				`);

				this.container = document.createElement("div")
				this.container.dataset.test = `${ property }-container`;
				this.container.append(document.createElement("div"));
				document.body.append(this.container);
			},

			tests: commonTests,
		},
	],
};
