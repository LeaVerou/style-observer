import StyleObserver from "../index.js";
import adoptCSS from "../src/util/adopt-css.js";

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

		// TODO: Use adoptCSS when https://github.com/LeaVerou/style-observer/issues/74 is fixed
		adoptCSS(
			`@property --registered-custom-property {
				syntax: "<number>";
				inherits: true;
				initial-value: 1;
			}`,
			iframe.contentDocument,
		);

		this.iframe = iframe;
	},

	run (property, value) {
		let target = this.iframe.contentDocument.body.children[0];

		let styleObserver;
		let stylePromise = new Promise((resolve, reject) => {
			styleObserver = new StyleObserver(records => resolve(records[0]), {
				target,
				properties: [property],
			});

			styleObserver.observe();

			setTimeout(reject, 300, new Error(`Expected ${property} to change, but it didn't.`));
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

		return Promise.all([reflowPromise, stylePromise]).then(([reflow, change]) => reflow);
	},

	afterEach () {
		this.iframe.remove();
	},

	skip: !PerformanceObserver.supportedEntryTypes.includes("layout-shift"),

	tests: [
		{
			name: "Properties not causing reflow",
			description:
				"Check whether observing a CSS property does not cause reflow (layout recalculation).",
			expect: false,
			tests: [
				{
					args: ["--custom-property", "bar"],
				},
				{
					args: ["--registered-custom-property", 42],
				},
				{
					args: ["color", "red"],
				},
				{
					args: ["visibility", "hidden"],
				},
			],
		},
		{
			name: "Properties causing reflow",
			description:
				"We need these tests to make sure that changing a CSS property causes reflow (layout recalculation).",
			expect: true,
			tests: [
				{
					args: ["height", "100px"],
				},
				{
					args: ["position", "absolute"],
				},
				{
					args: ["text-align", "center"],
				},
			],
		},
	],
};
