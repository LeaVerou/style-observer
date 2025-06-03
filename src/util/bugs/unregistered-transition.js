// Detect https://issues.chromium.org/issues/360159391

/**
 * Detect if the browser is affected by the unregistered transition bug.
 * @see https://issues.chromium.org/issues/360159391
 */
import Bug from "../Bug.js";

export default new Bug({
	name: "UNREGISTERED_TRANSITION",
	initialValue: true,
	detect () {
		let dummy = document.createElement("div");
		document.body.appendChild(dummy);
		let property = "--foo-" + Date.now();
		dummy.style.cssText = `${property}: 1; transition: ${property} 1ms step-start allow-discrete`;

		return new Promise(resolve => {
			requestAnimationFrame(() => {
				setTimeout(_ => resolve(true), 30);
				dummy.addEventListener("transitionstart", _ => resolve(false));
				dummy.style.setProperty(property, "2");
			});
		})
			.then(value => value)
			.finally(() => dummy.remove());
	},
});
