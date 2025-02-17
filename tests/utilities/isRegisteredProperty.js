import isRegisteredProperty from "../../src/util/is-registered-property.js";
import adoptCss from "../../src/util/adopt-css.js";
import types, { registerProperties } from "../util/types.js";

export default {
	name: "isRegisteredProperty()",

	beforeEach () {
		let iframe = document.createElement("iframe");
		document.body.append(iframe);

		this.data.iframe = iframe;
	},

	run (property) {
		if (typeof property === "object") {
			property = "--" + property.id;
		}

		return isRegisteredProperty(property, this.data.iframe.contentWindow);
	},

	afterEach () {
		this.data.iframe.remove();
	},

	getName () {
		let suffix = "";
		if (typeof this.arg === "object") {
			suffix = " (--" + this.arg.id + ")";
		}

		return this.parent.name + suffix;
	},

	expect: true,

	tests: [
		{
			name: "Inline style",
			beforeEach () {
				this.parent.parent.beforeEach.call(this);
				let property = this.arg;
				this.data.iframe.contentDocument.head.insertAdjacentHTML(
					"beforeend",
					`<style>
						@property --${property.id} {
							syntax: "${property.syntax}";
							inherits: ${property.inherits ?? "true"};
							initial-value: ${property.initialValue};
						}
					</style>`,
				);
			},
			tests: [
				{
					arg: types.any,
					expect: false,
				},
				{
					arg: {
						...types.any,
						id: types.any.id + "-non-inherited",
						inherits: false,
					},
				},
				{
					arg: types.number,
				},
			],
		},
		{
			name: "Adopted stylesheet",
			beforeEach () {
				this.parent.parent.beforeEach.call(this);
				let property = this.arg;
				adoptCss(
					`@property --${property.id} {
					syntax: "${property.syntax}";
					inherits: ${property.inherits ?? "true"};
					initial-value: ${property.initialValue};
				}`,
					this.data.iframe.contentDocument,
				);
			},
			tests: [
				{
					arg: types.any,
					expect: false,
				},
				{
					arg: {
						...types.any,
						id: types.any.id + "-non-inherited",
						inherits: false,
					},
				},
				{
					arg: types.number,
				},
			],
		},
		{
			name: "External stylesheet",
			async beforeEach () {
				this.parent.parent.beforeEach.call(this);
				let link = Object.assign(document.createElement("link"), {
					rel: "stylesheet",
					href: "./util/properties.css",
				});

				this.data.iframe.contentDocument.head.append(link);
				await new Promise(resolve => (link.onload = () => resolve()));
			},
			tests: [
				{
					arg: "--any-inherited",
					expect: false,
				},
				{
					arg: "--any-non-inherited",
				},
				{
					arg: "--number",
				},
			],
		},
		{
			name: "CSS.registerProperty()",
			beforeEach () {
				this.parent.parent.beforeEach.call(this);
				registerProperties({ globalThis: this.data.iframe.contentWindow });
			},
			tests: [
				{
					arg: "--registered-any",
					expect: false,
				},
				{
					arg: "--registered-any-non-inherited",
				},
				{
					arg: "--registered-number",
				},
			],
		},
		{
			name: "Non-registered property",
			arg: "--non-registered",
			expect: false,
		},
	],
};
