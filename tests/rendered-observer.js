import RenderedObserver from "../src/rendered-observer.js";

export default {
	name: "RenderedObserver",

	beforeEach () {
		let iframe = document.createElement("iframe");
		document.body.append(iframe);

		iframe.srcdoc = this.args[0];

		let result = {};
		result.promise = new Promise((resolve, reject) => {
			result.resolve = resolve;
			result.reject = reject;
		});

		let observer = new RenderedObserver(records => {
			result.resolve(records);
		});

		Object.assign(this.data, { iframe, observer, result });

		return new Promise(resolve => (iframe.onload = resolve));
	},

	run (DOM, target, property, value) {
		target = this.data.iframe.contentDocument.getElementById(target);
		let element = this.data.method && this.data.iframe.contentDocument.getElementById(value);

		let observer;
		return new Promise((resolve, reject) => {
			observer = new RenderedObserver(records => {
				resolve(records);
			});
			observer.observe(target);

			requestAnimationFrame(() => {
				if (this.data.method) {
					target[property](element);
				}
				else if (this.data.style) {
					target.style[property] = value;
				}
				else {
					target[property] = value;
				}
			});

			setTimeout(() => reject(), 500);
		})
			.then(records => records.length > 0)
			.catch(() => "Timed out")
			.finally(() => {
				observer.unobserve();
			});
	},

	expect: true,

	afterEach () {
		this.data.iframe.remove();
	},

	tests: [
		{
			name: "Move element",

			getName (...args) {
				let [DOM, target, method, element] = args;
				return `${target}.${method}(${element})`;
			},

			data: {
				method: true,
			},

			tests: [
				{
					args: [
						`<div id="container">
							Container content
						</div>
						<div id="child">Child content</div>`,
						"container",
						"append",
						"child",
					],
				},
				{
					args: [
						`<div id="container">
							Container content
							<div id="child">Child content</div>
						</div>`,
						"container",
						"after",
						"child",
					],
				},
			],
		},
		{
			name: "Shadow DOM",
			tests: [
				{
					name: "Slot",
					args: [
						`<div>
							<template shadowrootmode="open">
								Shadow content
								<slot name="foo"></slot>
							</template>
							<div id="element">Element content</div>
						</div>`,
						"element",
						"slot",
						"foo",
					],
				},
				{
					name: "Change slot (from existing to existing)",
					args: [
						`<div>
							<template shadowrootmode="open">
								Shadow content
								<slot name="foo"></slot>
								<slot name="bar"></slot>
							</template>
							<div slot="foo" id="slotted">Slotted content</div>
						</div>`,
						"slotted",
						"slot",
						"bar",
					],
				},
				{
					name: "Change slot (from non-existing to existing)",
					args: [
						`<div>
							<template shadowrootmode="open">
								Shadow content
								<slot name="foo"></slot>
							</template>
							<div slot="bar" id="slotted">Slotted content</div>
						</div>`,
						"slotted",
						"slot",
						"foo",
					],
				},
				{
					name: "Unslot",
					args: [
						`<div>
							<template shadowrootmode="open">
								Shadow content
								<slot name="foo"></slot>
							</template>
							<div slot="foo" id="slotted">Slotted content</div>
						</div>`,
						"slotted",
						"slot",
						""
					],
				},
			],
		},
		{
			name: "Visibility",
			data: {
				style: true,
			},
			tests: [{from: "block", to: "none"}, {from: "none", to: "block"}].map(({ from, to }) => {
				let DOM = `<div id="element" style="display: ${from}">Element content</div>`;
				return {
					name: `Change from “${from}” to “${to}”`,
					args: [DOM, "element", "display", to],
				};
			}),
		}
	],
};
