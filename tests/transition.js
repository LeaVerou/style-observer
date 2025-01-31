import StyleObserver from "../index.js";
import adoptCSS from "../src/util/adopt-css.js";

let testsStatic = [
	{
		args: ["opacity", "background-color .2s"],
	},
	{
		args: ["opacity", "background-color .2s, opacity .1s .05s"],
	},
	{
		args: ["opacity", "background-color .2s", "important"],
	},
	{
		args: ["opacity", "background-color .2s, opacity .1s .05s", "important"],
	},
	{
		args: ["--custom-property", "background-color .2s"],
	},
	{
		args: ["--custom-property", "background-color .2s, --custom-property .1s .05s"],
	},
	{
		args: ["--custom-property", "background-color .2s", "important"],
	},
	{
		args: ["--custom-property", "background-color .2s, --custom-property .1s .05s", "important"],
	},
];

// [property, transition, important, newTransition, newImportant]
let testsDynamic = [
	{
		args: ["opacity", "background-color .2s", "", "color 150ms"],
	},
	{
		args: ["opacity", "background-color .2s", "", "opacity 300ms, color 150ms"],
	},
	{
		args: ["opacity", "background-color .2s", "important", "color 150ms"],
	},
	{
		args: ["opacity", "background-color .2s", "important", "opacity 300ms, color 150ms"],
	},
	{
		args: ["--custom-property", "background-color .2s", "", "color 150ms", "important"],
	},
	{
		args: ["--custom-property", "background-color .2s", "", "--custom-property 300ms, color 150ms", "important"],
	},
	{
		args: ["--custom-property", "background-color .2s", "important", "color 150ms", "important"],
	},
	{
		args: ["--custom-property", "background-color .2s", "important", "--custom-property 300ms, color 150ms", "important"],
	},
	{
		args: ["opacity", "background-color .2s, opacity .1s .05s", "", "color 150ms"],
	},
	{
		args: ["opacity", "background-color .2s, opacity .1s .05s", "", "opacity 300ms, color 150ms"],
	},
	{
		args: ["opacity", "background-color .2s, opacity .1s .05s", "important", "color 150ms"],
	},
	{
		args: ["opacity", "background-color .2s, opacity .1s .05s", "important", "opacity 300ms, color 150ms"],
	},
	{
		args: ["--custom-property", "background-color .2s, --custom-property .1s .05s", "", "color 150ms", "important"],
	},
	{
		args: ["--custom-property", "background-color .2s, --custom-property .1s .05s", "", "color 150ms, --custom-property 300ms", "important"],
	},
	{
		args: ["--custom-property", "background-color .2s, --custom-property .1s .05s", "important", "color 150ms", "important"],
	},
	{
		args: ["--custom-property", "background-color .2s, --custom-property .1s .05s", "important", "--custom-property 300ms, color 150ms", "important"],
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
		this.target.remove();
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
