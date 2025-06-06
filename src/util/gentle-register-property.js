import adoptCSS from "./adopt-css.js";

const INITIAL_VALUES = {
	"<angle>": "0deg",
	"<color>": "transparent",
	"<custom-ident>": "none",
	"<image>": "linear-gradient(transparent 0% 100%)",
	"<integer>": "0",
	"<length>": "0px",
	"<length-percentage>": "0px",
	"<number>": "0",
	"<percentage>": "0%",
	"<resolution>": "1dppx",
	"<string>": "''",
	"<time>": "0s",
	"<transform-function>": "scale(1)",
	"<transform-list>": "scale(1)",
	"<url>": "url('')",
};

/**
 * All registered properties per document. Every property is associated with a style sheet with the corresponding `@property` rule.
 * @type { Map<Document, Record<string, CSSStyleSheet>> }
 */
let properties = new Map();

/**
 * Register a CSS custom property.
 * @param {string} property - Property name.
 * @param {Object} [meta] - Property definition.
 * @param {string} [meta.syntax] - Property syntax.
 * @param {boolean} [meta.inherits] - Whether the property inherits.
 * @param {*} [meta.initialValue] - Initial value.
 * @param {Document} [root] - Document to register the property in.
 */
export default function gentleRegisterProperty (property, meta = {}, root = globalThis.document) {
	let registeredProperties = properties.get(root);

	if (!property.startsWith("--") || (registeredProperties && property in registeredProperties)) {
		return;
	}

	let definition = {
		syntax: meta.syntax || "*",
		inherits: meta.inherits ?? true,
	};

	if (meta.initialValue !== undefined) {
		definition.initialValue = meta.initialValue;
	}
	else if (definition.syntax !== "*" && definition.syntax in INITIAL_VALUES) {
		definition.initialValue = INITIAL_VALUES[definition.syntax];
	}

	let styleSheet = adoptCSS(`@layer style-observer-registered-properties {
		@property ${property} {
			syntax: "${definition.syntax}";
			inherits: ${definition.inherits};
			${definition.initialValue !== undefined ? `initial-value: ${definition.initialValue};` : ""}
		}
	}`, root);

	if (!registeredProperties) {
		registeredProperties = {};
		properties.set(root, registeredProperties);
	}

	registeredProperties[property] = styleSheet;
}

/**
 * Unregister a CSS custom property if it was registered with `gentleRegisterProperty`.
 * @param {string} property - Property name.
 * @param {Document} [root=globalThis.document] - Document to unregister the property from.
 */
export function unregisterProperty (property, root = globalThis.document) {
	let registeredProperties = properties.get(root);

	if (!registeredProperties || !(property in registeredProperties)) {
		return;
	}

	let styleSheet = registeredProperties[property];
	if (root.adoptedStyleSheets) {
		root.adoptedStyleSheets = root.adoptedStyleSheets.filter(sheet => sheet !== styleSheet);
	}
	else {
		// Find the rule corresponding to the property and remove it
		let rules = styleSheet.cssRules;
		for (let i = 0; i < rules.length; i++) {
			let rule = rules[i].cssRules[0];
			if (rule.name === property) {
				styleSheet.deleteRule(i);
				break;
			}
		}
	}

	delete registeredProperties[property];
}
