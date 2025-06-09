import isRegisteredProperty from "../../src/util/is-registered-property.js";
import adoptCss from "../../src/util/adopt-css.js";

let properties = {
	"--any-inherited": {
		syntax: "*",
		inherits: true,
	},
	"--any-non-inherited": {
		syntax: "*",
		inherits: false,
	},
	"--number": {
		syntax: "<number>",
		inherits: true,
	},
};

let css = Object.entries(properties)
	.map(([property, meta]) => {
		return `@property ${property} {
		syntax: "${meta.syntax}";
		inherits: ${meta.inherits};
		initial-value: 0;
	}`;
	})
	.join("\n");

let tests = Object.entries(properties).map(([property, spec]) => {
	let typed = spec.syntax !== "*";
	let inherited = spec.inherits === true;

	return {
		name: (typed ? "Typed, " : "") + (inherited ? "Inherited" : "Non-inherited"),
		arg: property,
		expect: typed || !inherited,
	};
});

export default {
	name: "isRegisteredProperty()",

	beforeEach () {
		let iframe = document.createElement("iframe");
		document.body.append(iframe);

		this.data.iframe = iframe;

		if (this.data.srcdoc !== undefined) {
			iframe.srcdoc = this.data.srcdoc;
		}

		return new Promise(resolve => (iframe.onload = resolve));
	},

	run (property) {
		return new Promise(resolve => {
			requestAnimationFrame(() => {
				resolve(isRegisteredProperty(property, this.data.iframe.contentDocument));
			});
		});
	},

	afterEach () {
		this.data.iframe.remove();
	},

	expect: true,

	data: {
		srcdoc: "",
	},

	tests: [
		{
			name: "Style element",
			data: {
				srcdoc: `<style>${css}</style>`,
			},
			tests,
		},
		{
			name: "Adopted stylesheet",
			beforeEach () {
				this.parent.parent.beforeEach.call(this);
				adoptCss(css, this.data.iframe.contentDocument);
			},
			tests,
		},
		{
			name: "External stylesheet",
			data: {
				srcdoc: `<link rel="stylesheet" href="${URL.createObjectURL(new Blob([css], { type: "text/css" }))}">`,
			},
			tests,
		},
		{
			name: "CSS.registerProperty()",
			beforeEach () {
				this.parent.parent.beforeEach.call(this);
				const CSS = this.data.iframe.contentWindow.CSS;

				for (let property in properties) {
					let spec = properties[property];
					CSS.registerProperty({
						name: property,
						syntax: spec.syntax,
						inherits: spec.inherits,
						initialValue: "0",
					});
				}
			},
			tests,
		},
		{
			name: "Non-registered property",
			arg: "--non-registered",
			expect: false,
		},
	],
};
