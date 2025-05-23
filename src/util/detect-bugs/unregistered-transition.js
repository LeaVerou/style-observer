// Detect https://issues.chromium.org/issues/360159391

/**
 * Detect if the browser is affected by the unregistered transition bug.
 * @see https://issues.chromium.org/issues/360159391
 * @returns {Promise<boolean>}
 */
export default {
	value: undefined,
	get valuePending () {
		if (this.value !== undefined) {
			return this.value;
		}

		let dummy = document.createElement("div");
		document.body.appendChild(dummy);
		let property = "--foo-" + Date.now();
		dummy.style.cssText = `${property}: 1; transition: ${property} 1ms step-start allow-discrete`;

		delete this.valuePending;
		return (this.valuePending = new Promise(resolve => {
			requestAnimationFrame(() => {
				setTimeout(_ => resolve(true), 30);
				dummy.addEventListener("transitionstart", _ => resolve(false));
				dummy.style.setProperty(property, "2");
			});
		})
			.then(v => (this.value = v))
			.finally(() => dummy.remove()));
	},
};
