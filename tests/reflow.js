import StyleObserver from "../index.js";

export default {
	name: "Reflow (layout recalculation)",

	beforeEach () {
		let iframe = document.createElement("iframe");
		document.body.append(iframe);

		for (let i = 0; i < 2; i++) {
			let dummy = Object.assign(document.createElement("div"), {
				textContent: "Style Observer Test",
				style: "--custom-property: foo;",
			});

			iframe.contentDocument.body.append(dummy);
		}

		iframe.contentDocument.head.insertAdjacentHTML(
			"beforeend",
			`<style>
				@property --registered-custom-property {
					syntax: "<number>";
					inherits: true;
					initial-value: 1;
				}
			</style>`,
		);

		this.iframe = iframe;
	},

	run (property, value) {
		let target = this.iframe.contentDocument.body.children[0];

		let styleObserver;
		let stylePromise = new Promise(resolve => {
			styleObserver = new StyleObserver(records => resolve(records[0]), {
				target,
				properties: [property],
			});

			styleObserver.observe();

			setTimeout(resolve, 300, {});
		}).finally(() => {
			styleObserver.unobserve();
		});

		let reflowObserver;
		let reflowPromise = new Promise(resolve => {
			reflowObserver = new this.iframe.contentWindow.PerformanceObserver(list => {
				for (let entry of list.getEntries()) {
					console.log(
						`Reflow detected: ${entry.startTime}ms, duration: ${entry.duration}ms`,
					);

					let sources = entry.sources.map(source => source.node.nodeName);
					console.log(`Source(s): ${sources.join(", ")}`);

					resolve(true);
				}
			});

			reflowObserver.observe({ type: "layout-shift" });

			setTimeout(resolve, 300, false);
		}).finally(() => {
			reflowObserver.disconnect();
		});

		setTimeout(() => {
			target.style.setProperty(property, value);
		}, 50);

		return Promise.all([reflowPromise, stylePromise]).then(([reflow, change]) => [
			reflow,
			change.value,
		]);
	},

	afterEach () {
		this.iframe.remove();
	},

	tests: [
		{
			name: "Properties not causing reflow",
			description:
				"Check whether observing a CSS property does not cause reflow (layout recalculation).",
			tests: [
				{
					args: ["--custom-property", "bar"],
					expect: [false, "bar"],
					skip: true,
				},
				{
					args: ["--registered-custom-property", 42],
					expect: [false, "42"],
				},
				{
					args: ["color", "red"],
					expect: [false, "rgb(255, 0, 0)"],
				},
				{
					args: ["visibility", "hidden"],
					expect: [false, "hidden"],
				},
			],
		},
		{
			name: "Properties causing reflow",
			description:
				"Don't skip these tests to make sure that changing a CSS property causes reflow (layout recalculation)",
			tests: [
				{
					args: ["height", "100px"],
					expect: [true, "100px"],
				},
				{
					args: ["position", "absolute"],
					expect: [true, "absolute"],
				},
				{
					args: ["text-align", "center"],
					expect: [true, "center"],
				},
			],
		},
	],
};
