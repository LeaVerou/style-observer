import RenderedObserver from "../src/rendered-observer.js";

export default {
	name: "RenderedObserver",

	beforeEach () {
		let iframe = document.createElement("iframe");
		document.body.append(iframe);

		this.data.iframe = iframe;

		iframe.srcdoc = "";
		if (this.data.srcdoc !== undefined) {
			iframe.srcdoc = this.data.srcdoc;
		}

		return new Promise(resolve => (iframe.onload = resolve));
	},

	afterEach () {
		this.data.iframe.remove();
	},

	tests: [
		{
			name: "Light DOM",

			data: {
				srcdoc: `
					<div id=container>
						Container content
					</div>

					<div id=child>Child content</div>
				`,
			},

			run (operation) {
				let container = this.data.iframe.contentDocument.getElementById("container");
				let child = this.data.iframe.contentDocument.getElementById("child");

				if (operation === "after") {
					container.append(child);
				}

				let observer;
				return new Promise((resolve, reject) => {
					observer = new RenderedObserver(records => {
						resolve(records);
					});
					observer.observe(container);

					requestAnimationFrame(() => {
						container[operation](child);
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

			tests: [
				{
					name: "To container",
					arg: "append",
				},
				{
					name: "After container",
					arg: "after",
				},
			],
		},
	],
};
