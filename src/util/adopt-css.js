let style;

/**
 * @param {string} css
 */
export default function adoptCSS (css, document = globalThis.document) {
	let window = document.defaultView;
	if (document.adoptedStyleSheets) {
		let sheet = new window.CSSStyleSheet();
		sheet.replaceSync(css);

		if (Object.isFrozen(document.adoptedStyleSheets)) {
			document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
		}
		else {
			document.adoptedStyleSheets.push(sheet);
		}
	}
	else {
		style ??= document.head.appendChild(document.createElement("style"));

		style.insertAdjacentText("beforeend", css);
	}
}
