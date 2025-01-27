import StyleObserver from "../src/index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";

let initialData = {
	angle: "0deg",
	color: "transparent",
	"custom-ident": "foo",
	image: "linear-gradient(transparent, transparent)",
	integer: "0",
	length: "0px",
	"length-percentage": "0%",
	number: "0",
	percentage: "0%",
	resolution: "96dpi",
	string: "''",
	time: "0s",
	"transform-function": "scale(1)",
	"transform-list": "scale(1) rotate(0deg)",
	url: "url(https://foo.dev/)",
	"*": "0"
};

let testData = {
	angle: "360deg",
	color: "rgb(0, 0, 0)",
	"custom-ident": "style-observer",
	image: "linear-gradient(rgb(0, 0, 255), rgb(255, 0, 0))",
	integer: "42",
	length: "42px",
	"length-percentage": "100%",
	number: "42",
	percentage: "100%",
	resolution: "42dppx",
	string: `"style-observer"`,
	time: "42s",
	"transform-function": "scale(0)",
	"transform-list": "matrix(1, 0, 0, 1, 0, 0)",
	url: `url("https://style.observer/")`,
	"*": "foo"
};

export default {
	name: "Custom property syntax descriptor",

	beforeEach () {
		this.dummy = document.createElement("div");
		document.body.append(this.dummy);

		if (this.data.syntax) {
			let { name, syntax, initialValue } = this.arg;

			gentleRegisterProperty(name, { syntax, initialValue });
		}
	},

	run () {
		let name, type, value, observer;

		if (this.data.syntax) {
			name = this.arg.name;
			value = this.arg.value;
		}
		else {
			[type, value] = this.args;
			name = type === "*" ? "--prop-star" : `--prop-${ type }`;
		}

		return new Promise((resolve, reject) => {
			observer = new StyleObserver(records => {
				resolve(records);
			}, { target: this.dummy, properties: [name] });
			
			this.dummy.style.setProperty(name, value);

			// Timeout after 500ms
			setTimeout(() => reject(), 500);
		})
		.then(records => records[0].value)
		.catch(() => "Timed out")
		.finally(() => {
			observer.unobserve();
		});
	},

	afterEach () {
		this.dummy.remove();
	},

	tests: [
		{
			name: "Data types",

			beforeAll () {
				for (let [type, value] of Object.entries(initialData)) {
					let syntax = type === "*" ? "*" : `<${ type }>`;
					let name = type === "*" ? "--prop-star" : `--prop-${ type }`; // `--prop-*` makes the test fail

					gentleRegisterProperty(name, { syntax, initialValue: value });
				}
			},

			tests: Object.entries(testData).map(([type, value]) => ({
				args: [type, value],
				expect: value,
			})),
		},
		{
			name: "Syntax",
			data: {
				syntax: true,
			},
			tests: [
				{
					name: "Multiple data types",
					arg: {
						name: "--prop-length-percentage",
						syntax: "<length> | <percentage>",
						initialValue: "1px",
						value: "100%",
					},
					expect: "100%",
				},
				{
					name: "Space-separated values",
					arg: {
						name: "--prop-space-separated",
						syntax: "<length>+",
						initialValue: "1px 2px",
						value: "3px 4px",
					},
					expect: "3px 4px",
				},
				{
					name: "Comma-separated values",
					arg: {
						name: "--prop-comma-separated",
						syntax: "<integer>#",
						initialValue: "0",
						value: "1,2",
					},
					expect: "1, 2",
				},
				{
					name: "Keywords",
					arg: {
						name: "--prop-keywords",
						syntax: "small | medium | large",
						initialValue: "small",
						value: "large",
					},
					expect: "large",
				},
				{
					name: "Combination of data type and keyword",
					arg: {
						name: "--prop-combination",
						syntax: "<length> | auto",
						initialValue: "42px",
						value: "auto",
					},
					expect: "auto",
				},
			],
		},
	],
};
