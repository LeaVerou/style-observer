// In Safari < 18.2, transitioning custom properties of syntax `*` or `<string>`
// causes an infinite loop of `transitionrun` or `transitionstart` events.
// We use this test to detect the bug.

/**
 * Detect if the browser is affected by the Safari transition loop bug.
 * @see https://bugs.webkit.org/show_bug.cgi?id=279012
 * @returns {Promise<boolean>}
 */
import Bug from "../Bug.js";

export default new Bug({
	initialValue: true,
	detect () {
		if (this.value !== undefined) {
			return this.value;
		}

		let dummy = document.createElement("div");
		document.body.appendChild(dummy);
		let property = "--bar-" + Date.now();
		dummy.style.cssText = `${property}: 1; transition: ${property} 1ms step-start allow-discrete`;

		return new Promise(resolve => {
			let eventsCount = 0;
			requestAnimationFrame(() => {
				setTimeout(_ => resolve(eventsCount > 1), 50);
				dummy.addEventListener("transitionrun", _ => eventsCount++);
				dummy.style.setProperty(property, "2");
			});
		})
			.then(v => (this.value = v))
			.finally(() => dummy.remove());
	},
});
