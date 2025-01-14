let style;

export default function adoptCSS (css) {
	if (document.adoptedStyleSheets) {
		let sheet = new CSSStyleSheet();
		sheet.replaceSync(css);
		document.adoptedStyleSheets.push(sheet);
	}
	else {
		style ??= document.head.appendChild(document.createElement("style"));

		style.insertAdjacentText("beforeend", css);
	}
}
