import StyleObserver from "../index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";
import tests from "./tests.js";

export default {
	name: "Basic",

	run ({property, meta, initial, value}) {
		let dummy = document.createElement("div");
		document.body.append(dummy);

		let observer;
		return new Promise((resolve, reject) => {
			observer = new StyleObserver(records => {
				resolve(records);
			});

			if (meta) {
				gentleRegisterProperty(property, meta);
			}

			if (initial) {
				dummy.style.setProperty(property, initial);
			}

			observer.observe(dummy, property);

			dummy.style.setProperty(property, value);

			// Timeout after 500ms
			setTimeout(() => reject(), 500);
		})
		.catch(_ => {
			return [{ value: "Timed out" }];
		})
		.then(records => records[0].value)
		.finally(() => {
			observer.unobserve(dummy);
			dummy.remove();
		});
	},

	tests,
};
