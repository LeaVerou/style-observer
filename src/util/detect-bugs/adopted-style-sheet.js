import gentleRegisterProperty from "../gentle-register-property.js";

/**
 * Detect if the browser is affected by the Safari adopted style sheet bug:
 * removing a CSS custom property from an adopted stylesheet in a ShadowRoot
 * does not update the computed value as expected and doesn't trigger a transition.
 * @returns {{value: boolean, valuePending: boolean}}
 */
export default {
	get value () {
		gentleRegisterProperty("--style-observer-adopted-style-sheet-bug", {
			syntax: "<number>",
			inherits: true,
			initialValue: 0,
		});

		let dummy = document.createElement("div");
		document.body.append(dummy);
		dummy.attachShadow({ mode: "open" });
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
		delete this.value;

		return (this.value = oldValue === newValue);
	},
	get valuePending () {
		delete this.valuePending;
		return this.value;
	},
};
