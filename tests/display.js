import StyleObserver from "../index.js";

export default {
	name: "The display property",

	run ({ from, to }) {
		let dummy = document.createElement("div");
		document.body.append(dummy);

		if (from) {
			dummy.style.setProperty("display", from);
		}

		let observer;
		return new Promise((resolve, reject) => {
			observer = new StyleObserver(records => {
				resolve(records);
			}, { target: dummy, properties: ["display"] });

			dummy.style.setProperty("display", to);

			// Timeout after 500ms
			setTimeout(() => reject(), 500);
		})
		.then(records => records[0].value)
		.catch(() => "Timed out")
		.finally(() => {
			observer.unobserve();
			dummy.remove();
		});
	},

	tests: [
		{
			name: "To none",
			arg: { to: "none" },
			expect: "none",
		},
		{
			name: "From none",
			arg: { from: "none", to: "block" },
			expect: "block",
		},
		{
			name: "From not none to not none",
			arg: { from: "grid", to: "flex" },
			expect: "flex",
		},
		{
			name: "From not none to not none (flex to grid)",
			arg: { from: "flex", to: "grid" },
			expect: "grid",
		},
	],
};
