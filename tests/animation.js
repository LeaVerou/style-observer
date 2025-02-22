import StyleObserver from "../src/style-observer.js";
import adoptCSS from "../src/util/adopt-css.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";

let testIndex = 0;
let dummy;

export default {
	name: "CSS animations",
	description:
		"These tests check if the changes caused by CSS animations are correctly observed.",

	beforeAll () {
		dummy = document.createElement("div");
		document.body.append(dummy);

		gentleRegisterProperty("--registered", { syntax: "<number>", initialValue: 0 });
	},

	beforeEach () {
		let element = Object.assign(document.createElement("div"), { id: `test-${++testIndex}` });
		document.body.append(element);

		let result = {};
		result.promise = new Promise((resolve, reject) => {
			result.resolve = resolve;
			result.reject = reject;
		});

		let observer = new StyleObserver(records => {
			this.data.value = records[0].value;
		});

		Object.assign(this.data, { element, observer, result });
	},

	run (property, keyframes, animation) {
		let { observer, element, result, css } = this.data;

		adoptCSS(`
			@keyframes ${element.id} {
				${keyframes}
			}

			#${element.id} {
				animation: ${animation};
				animation-name: ${element.id};
				${css || ""}
			}
		`);

		observer.observe(element, property);

		setTimeout(() => {
			if (this.data.value === undefined) {
				result.reject(new Error("Timeout"));
			}

			result.resolve(this.data.value);
		}, 500);

		return result.promise;
	},

	afterEach () {
		this.data.observer.unobserve(this.data.element);
		this.data.element.remove();
	},

	afterAll () {
		dummy.remove();
	},

	check: { looseTypes: true },

	tests: [
		{
			name: "Basic animations",
			expect: 0,
			tests: [
				{
					name: "One property",
					args: ["opacity", "to { opacity: 0; }", "160ms linear forwards"],
				},
				{
					name: "Two properties",
					args: ["text-align", "to { opacity: 0; text-align: center; }", "160ms linear forwards"],
					expect: "center",
				},
				{
					name: "Delayed",
					args: ["opacity", "to { opacity: 0; }", "160ms linear 50ms forwards"],
				},
				{
					name: "Not observed property",
					args: ["text-align", "to { opacity: 0; }", "160ms linear forwards"],
					throws: true,
				},
			],
		},
		{
			name: "Direction",
			tests: [
				{
					name: "alternate",
					args: ["opacity", "to { opacity: 0; }", "160ms linear alternate"],
					expect: 1,
				},
			],
		},
		{
			name: "Play state",
			tests: [
				{
					name: "paused",
					args: ["opacity", "to { opacity: 0; }", "160ms linear paused"], // can we observe this?
					throws: true,
				},
			],
		},
		{
			name: "Fill mode",
			tests: [
				{
					name: "backwards",
					args: ["opacity", "to { opacity: 0; }", "160ms linear backwards"],
					expect: 1,
				},
				{
					name: "both",
					args: ["opacity", "to { opacity: 0; }", "160ms linear both"],
					expect: 0,
				},
			],
		},
		{
			name: "Iteration count",
			tests: [
				{
					name: "Integer",
					args: ["opacity", "to { opacity: 0; }", "160ms linear 2 forwards"],
					expect: 0,
				},
				{
					name: "Fractional",
					args: ["opacity", "to { opacity: 0; }", "160ms linear 1.5 forwards"],
					expect: 0.5,
				},
				{
					name: "Infinite",
					args: ["opacity", "to { opacity: 0; }", "160ms linear infinite"], // can we observe this?
					skip: true,
				},
			],
		},
		{
			name: "Composition",

			map (value) {
				let property = this.args[0];
				dummy.style.setProperty(property, value);
				let computed = getComputedStyle(dummy).getPropertyValue(property);
				return computed;
			},

			skip: !CSS.supports("animation-composition", "add"),

			tests: [
				{
					name: "add",
					data: {
						css: "transform: translateX(30px) rotate(45deg); animation-composition: add;",
					},
					args: [
						"transform",
						"to { transform: translateX(150px); }",
						"160ms linear forwards",
					],
					expect: "translateX(30px) rotate(45deg) translateX(150px)",
				},
				{
					name: "accumulate",
					data: {
						css: "transform: translateX(30px) rotate(45deg); animation-composition: accumulate;",
					},
					args: [
						"transform",
						"to { transform: translateX(150px); }",
						"160ms linear forwards",
					],
					expect: "translateX(180px) rotate(45deg)",
				},
			],
		},
		{
			name: "Custom properties",
			tests: [
				{
					name: "Unregistered",
					args: ["--unregistered", "from { --unregistered: 0; } to { --unregistered: 42; }", "160ms linear 0.5 forwards"],
					expect: "42",
				},
				{
					name: "Registered",
					args: ["--registered", "to { --registered: 42; }", "160ms linear 0.5 forwards"],
					expect: "21",
				},
			],
		},
	],
};
