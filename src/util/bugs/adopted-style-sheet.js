/**
 * Detect if the browser is affected by the Safari adopted style sheet bug:
 * removing a CSS custom property from an adopted stylesheet in a ShadowRoot
 * does not update the computed value as expected and doesn't trigger a transition.
 * @see https://bugs.webkit.org/show_bug.cgi?id=293556
 */
import gentleRegisterProperty from "../gentle-register-property.js";
import Bug from "../Bug.js";

export default new Bug({
	name: "ADOPTED_STYLE_SHEET",
	detect () {
		let dummy = document.createElement("div");
		document.body.append(dummy);
		dummy.attachShadow({ mode: "open" });

		if (Object.isFrozen(dummy.shadowRoot.adoptedStyleSheets)) {
			// The browser doesn't support the modern adoptedStyleSheets API, i.e., it is not affected by the bug
			dummy.remove();

			return false;
		}

		gentleRegisterProperty("--style-observer-adopted-style-sheet-bug", {
			syntax: "<number>",
			inherits: true,
			initialValue: 0,
		});

		let sheet = new CSSStyleSheet();
		sheet.insertRule(`
			:host {
				/* This declaration shouldn't be empty for the bug to trigger */
				color: transparent;
			}
		`);

		dummy.shadowRoot.adoptedStyleSheets.push(sheet);
		let style = sheet.cssRules[0].style;

		style.setProperty("--style-observer-adopted-style-sheet-bug", "1");
		let cs = getComputedStyle(dummy);
		let oldValue = cs.getPropertyValue("--style-observer-adopted-style-sheet-bug");

		style.removeProperty("--style-observer-adopted-style-sheet-bug");
		cs = getComputedStyle(dummy);
		let newValue = cs.getPropertyValue("--style-observer-adopted-style-sheet-bug");

		dummy.remove();

		return oldValue === newValue;
	},
});
