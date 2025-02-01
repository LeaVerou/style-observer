import StyleObserver from "../index.js";
import adoptCSS from "../src/util/adopt-css.js";

let testsStatic = [
	{
		args: ["opacity", "background-color 20ms"],
	},
	{
		args: ["opacity", "background-color 20ms, opacity .1s .05s"],
	},
	{
		args: ["opacity", "background-color 20ms", "important"],
	},
	{
		args: ["opacity", "background-color 20ms, opacity .1s .05s", "important"],
	},
	{
		args: ["--custom-property", "background-color 20ms"],
	},
	{
		args: ["--custom-property", "background-color 20ms, --custom-property .1s .05s allow-discrete"],
	},
	{
		args: ["--custom-property", "background-color 20ms", "important"],
	},
	{
		args: ["--custom-property", "background-color 20ms, --custom-property .1s .05s allow-discrete", "important"],
	},
];

// [property, transition, important, newTransition, newImportant]
let testsDynamic = [
	{
		args: ["opacity", "background-color 20ms", "", "color 15ms"],
	},
	{
		args: ["opacity", "background-color 20ms", "", "opacity 30ms, color 15ms"],
	},
	{
		args: ["opacity", "background-color 20ms", "important", "color 15ms"],
	},
	{
		args: ["opacity", "background-color 20ms", "important", "opacity 30ms, color 15ms"],
	},
	{
		args: ["--custom-property", "background-color 20ms", "", "color 15ms", "important"],
	},
	{
		args: ["--custom-property", "background-color 20ms", "", "--custom-property 30ms allow-discrete, color 15ms", "important"],
	},
	{
		args: ["--custom-property", "background-color 20ms", "important", "color 15ms", "important"],
	},
	{
		args: ["--custom-property", "background-color 20ms", "important", "--custom-property 30ms allow-discrete, color 15ms", "important"],
	},
	{
		args: ["opacity", "background-color 20ms, opacity .1s .05s", "", "color 15ms"],
	},
	{
		args: ["opacity", "background-color 20ms, opacity .1s .05s", "", "opacity 30ms, color 15ms"],
	},
	{
		args: ["opacity", "background-color 20ms, opacity .1s .05s", "important", "color 15ms"],
	},
	{
		args: ["opacity", "background-color 20ms, opacity .1s .05s", "important", "opacity 30ms, color 15ms"],
	},
	{
		args: ["--custom-property", "background-color 20ms, --custom-property .1s .05s", "", "color 15ms", "important"],
	},
	{
		args: ["--custom-property", "background-color 20ms, --custom-property .1s .05s", "", "color 15ms, --custom-property 30ms allow-discrete", "important"],
	},
	{
		args: ["--custom-property", "background-color 20ms, --custom-property .1s .05s", "important", "color 15ms", "important"],
	},
	{
		args: ["--custom-property", "background-color 20ms, --custom-property .1s .05s", "important", "--custom-property 30ms allow-discrete, color 15ms", "important"],
	},
];

export default {
	name: "The existing transition property",

	beforeEach () {
		let [property, transition, important] = this.args;

		this.target = document.createElement("div");

		if (this.data.inline) {
			this.target.style.setProperty("transition", transition, important);
		}
		else {
			let id = crypto.randomUUID();
			id = property + "-" + id;
			this.target.id = id;

			adoptCSS(`
				#${ id } {
					transition: ${ transition } ${ important ? "!important" : "" };
				}
			`);
		}

		document.body.append(this.target);
	},

	run (property, transition, important, newTransition, newImportant) {
		this.target.style.setProperty(property, "0");

		let observer;
		return new Promise(resolve => {
			observer = new StyleObserver(records => resolve(records));
			observer.observe(this.target, property);

			let { inline, dynamic } = this.data;
			if (dynamic) {
				if (inline) {
					this.target.style.setProperty("transition", newTransition, newImportant);
				}
				else {
					adoptCSS(`
						#${ this.target.id } {
							transition: ${ newTransition } ${ newImportant ? "!important" : "" };
						}
					`);
				}

				observer.updateTransition(this.target);
			}

			this.target.style.setProperty(property, "1");

			// Give the test 500ms to run
			setTimeout(resolve, 500, []);
		})
		.then(records => records.length > 0)
		.finally(() => observer.unobserve());
	},

	afterEach () {
		// this.target.remove();
	},

	expect: true,

	tests: [
		{
			name: "Inline styles",

			data: {
				inline: true,
			},

			tests: testsStatic,
		},
		{
			name: "CSS rule",
			tests: testsStatic,
		},
		{
			name: "Dynamically updated inline styles",

			data: {
				inline: true,
				dynamic: true,
			},

			tests: testsDynamic,
		},
		{
			name: "Dynamically updated CSS rule",

			data: {
				dynamic: true,
			},

			skip: true,
			tests: testsDynamic,
		},
	],
};
