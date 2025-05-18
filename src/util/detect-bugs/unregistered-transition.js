// Detect https://issues.chromium.org/issues/360159391

let result = null;

/**
 * Detect if the browser is affected by the unregistered transition bug.
 * @see https://issues.chromium.org/issues/360159391
 * @returns {Promise<boolean>}
 */
export default function detectUnregisteredTransitionBug () {
	if (result !== null) {
		return result;
	}

	let dummy = document.createElement("div");
	document.body.appendChild(dummy);
	let property = "--foo-" + Date.now();
	dummy.style.cssText = `${property}: 1; transition: ${property} 1ms step-start allow-discrete`;

	result = new Promise(resolve => {
		requestAnimationFrame(() => {
			setTimeout(_ => resolve(true), 30);
			dummy.addEventListener("transitionstart", _ => resolve(false));
			dummy.style.setProperty(property, "2");
		});
	}).finally(() => dummy.remove());

	return result;
}
