import { getTimesFor, splitCommas, isRegisteredProperty } from "../src/util.js";

export default {
	name: "Utility functions",
	getName() {
		// TODO use first arg for level 2 tests with no name
		if (this.level === 1) {
			return this.run.name + "()";
		}
		else {
			return this.args[0];
		}
	},
	tests: [
		{
			run: getTimesFor,
			tests: [
				// Basic single property cases
				{
					name: "property name | duration",
					args: ["margin-right", "margin-right 4s"],
					expect: {
						duration: 4000,
						delay: 0,
					},
				},
				{
					name: "property name | duration | easing function",
					args: ["margin-right", "margin-right 4s ease-in-out"],
					expect: {
						duration: 4000,
						delay: 0,
					},
				},
				{
					name: "property name | duration | delay",
					args: ["margin-right", "margin-right 4s 1s"],
					expect: {
						duration: 4000,
						delay: 1000,
					},
				},
				{
					name: "property name | duration | easing function | delay",
					args: ["margin-right", "margin-right 4s ease-in-out 1s"],
					expect: {
						duration: 4000,
						delay: 1000,
					},
				},
				{
					name: "property name | duration | negative delay",
					args: ["opacity", "opacity 2s -500ms"],
					expect: {
						duration: 2000,
						delay: -500,
					},
				},
				{
					name: "property name | mixed time units",
					args: ["opacity", "opacity 1s 500ms"],
					expect: {
						duration: 1000,
						delay: 500,
					},
				},
				// Multiple properties
				{
					name: "Apply to 2 properties (first property)",
					args: ["margin-right", "margin-right 4s, color 1s"],
					expect: {
						duration: 4000,
						delay: 0,
					},
				},
				{
					name: "Apply to 2 properties (second property)",
					args: ["color", "margin-right 4s, color 1s"],
					expect: {
						duration: 1000,
						delay: 0,
					},
				},
				// Different order of components
				{
					name: "easing function | duration | property name",
					args: ["opacity", "ease-out 0.5s opacity"],
					expect: {
						duration: 500,
						delay: 0,
					},
				},
				{
					name: "duration | property name | easing function | delay",
					args: ["transform", "2s transform cubic-bezier(0.4, 0, 0.2, 1) 150ms"],
					expect: {
						duration: 2000,
						delay: 150,
					},
				},
				// Complex multiple properties
				{
					name: "timing function | duration | property name, easing function | duration | property name",
					args: ["background-color", "linear 300ms background-color, ease-in 2s opacity"],
					expect: {
						duration: 300,
						delay: 0,
					},
				},
				{
					name: "timing function | duration | property name, easing function | duration | property name",
					args: ["opacity", "linear 300ms background-color, ease-in 2s opacity"],
					expect: {
						duration: 2000,
						delay: 0,
					},
				},
				{
					name: "timing function | property name | duration | delay, property name | duration",
					args: ["margin", "step-end margin 1.5s 50ms, width 2s"],
					expect: {
						duration: 1500,
						delay: 50,
					},
				},
				{
					name: "timing function | property name | duration | delay, property name | duration",
					args: ["width", "step-end margin 1.5s 50ms, width 2s"],
					expect: {
						duration: 2000,
						delay: 0,
					},
				},
				// Special keywords and functions
				{
					name: "Apply to all changed properties (with all keyword)",
					args: ["opacity", "all 0.5s ease-out allow-discrete"],
					expect: {
						duration: 500,
						delay: 0,
					},
				},
				{
					name: "property name | duration | steps timing function",
					args: ["opacity", "opacity 2s steps(4, jump-start)"],
					expect: {
						duration: 2000,
						delay: 0,
					},
				},
				// Special behaviors and custom properties
				{
					name: "property name | duration | behavior",
					args: ["display", "display 4s allow-discrete"],
					expect: {
						duration: 4000,
						delay: 0,
					},
				},
				{
					name: "property name | duration | easing function | behavior | delay",
					args: ["--custom-prop", "--custom-prop 750ms ease allow-discrete 250ms"],
					expect: {
						duration: 750,
						delay: 250,
					},
				},
				{
					name: "Don't split on commas inside parentheses",
					args: ["transform", "width 1s steps(4, jump-start), opacity linear(0, 25%, 0.75, 100%) 2s, cubic-bezier(0.4, 0, 0.2, 1) 2s transform 150ms"],
					expect: {
						duration: 2000,
						delay: 150,
					},
				},
				{
					name: "Last rule for one property wins",
					args: ["opacity", "opacity 1s, opacity 2s"],
					expect: {
						duration: 2000,
						delay: 0,
					},
				},
			],
		},
		{
			run: splitCommas,
			tests: [
				{
					arg: 'a, b, c',
					expect: ['a', 'b', 'c'],
				},
				{
					arg: "a",
					expect: ["a"],
				},
				{
					arg: 'a, b, (c, d), e',
					expect: ['a', 'b', '(c, d)', 'e'],
				}
			],
		},
		{
			run: isRegisteredProperty,
			tests: [
				{
					beforeAll () {
						document.head.insertAdjacentHTML(
							"beforeend",
							`<link rel="stylesheet" href="./util/custom-property.css" />`,
						);

						document.head.insertAdjacentHTML(
							"beforeend",
							`<style>
								@property --inline-style {
									syntax: "<color>";
									inherits: false;
									initial-value: red;
								}
							</style>`,
						);

						let sheet = new CSSStyleSheet();
						sheet.replaceSync(`
							@property --adopted-stylesheet {
								syntax: "<number>";
								inherits: true;
								initial-value: 1;
							}
						`);
						document.adoptedStyleSheets.push(sheet);

						CSS.registerProperty({
							name: "--registered-property",
							syntax: "small | medium | large",
							inherits: false,
							initialValue: "medium",
						});
					},
					expect: true,
					tests: [
						"--external-stylesheet",
						"--inline-style",
						"--adopted-stylesheet",
						"--registered-property",
					].map(arg => ({ arg })),
				},
				{
					arg: "--not-registered-property",
					expect: false,
				},
			],
		},
	],
};
