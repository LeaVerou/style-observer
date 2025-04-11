import StyleObserver from "../index.js";

export default {
	name: "Disconnected element",

	run (property, value) {
		let dummy = document.createElement("div");

		if (this.data.connected) {
			document.body.append(dummy);
		}

		dummy.style.opacity = 0.5;
		dummy.style.height = "100px";

		let observer;
		return (
			new Promise((resolve, reject) => {
				let records = [];
				observer = new StyleObserver(entries => records.push(...entries), {
					target: dummy,
					properties: ["opacity", "height"],
				});

				requestAnimationFrame(() => {
					// Disconnect the element
					dummy.remove();

					// Update it
					dummy.style.setProperty(property, value);

					// Reconnect
					requestAnimationFrame(() => {
						document.body.append(dummy);
					});
				});

				setTimeout(() => resolve(records), 200);

				// Timeout after 500ms
				setTimeout(() => reject(), 500);
			})
				// After we disconnect the element, the observer will fire a record
				// with the value of the property equal to an empty string.
				// In that case, we use the old value.
				.then(records => records.map(r => r.value || r.oldValue))
				.catch(() => "Timed out")
				.finally(() => {
					observer.unobserve();
					dummy.remove();
				})
		);
	},

	check: {
		looseTypes: true,
		deep: true,
	},

	tests: [
		{
			name: "Disconnected → Connected",
			tests: [
				{
					args: ["opacity", 0.75],
					expect: [0.75, "100px"],
				},
				{
					args: ["height", "10px"],
					expect: [0.5, "10px"],
				},
			],
		},
		{
			name: "Connected → Disconnected → Connected",
			tests: [
				{
					data: {
						connected: true,
					},
					args: ["height", "50px"],
					expect: [0.5, "100px", 0.5, "50px"],
				},
			],
		},
	],
};
