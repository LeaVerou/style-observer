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
 * All registered properties.
 * @type { Set<string> }
 * @private
 */
let _properties = new Set();

/**
 * The style sheet that contains the registered properties (if the modern adoptedStyleSheets API is supported).
 * @type { CSSStyleSheet }
 * @private
 */
let _styleSheet;

/**
 * The style element that contains the registered properties (if the modern adoptedStyleSheets API is not supported).
 * @type { HTMLStyleElement }
 * @private
 */
let _styleElement;

/**
 * CSS `@property` rules to be added to the CSS layer with all properties that should be registered.
 * @type { string }
 * @private
 */
let _layerRules = "";

/**
 * Register a CSS custom property.
 * @param {string} property - Property name.
 * @param {Object} [meta] - Property definition.
 * @param {string} [meta.syntax] - Property syntax.
 * @param {boolean} [meta.inherits] - Whether the property inherits.
 * @param {*} [meta.initialValue] - Initial value.
 * @param {Window} [window] - Window to register the property in.
 */
export default function gentleRegisterProperty (property, meta = {}, window = globalThis) {
	if (!property.startsWith("--") || _properties.has(property)) {
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

	_properties.add(property);

	_layerRules += `@property ${property} {
		syntax: "${definition.syntax}";
		inherits: ${definition.inherits};
		${definition.initialValue !== undefined ? `initial-value: ${definition.initialValue};` : ""}
	}\n`;

	if (!_styleSheet && window.document.adoptedStyleSheets && !Object.isFrozen(window.document.adoptedStyleSheets)) {
		// The modern adoptedStyleSheets API is supported
		_styleSheet = new CSSStyleSheet();
		window.document.adoptedStyleSheets.push(_styleSheet);
	}

	if (!_styleSheet && !_styleElement) {
		// The modern adoptedStyleSheets API is not supported
		_styleElement = Object.assign(window.document.createElement("style"), { id: "style-observer-styles" });
		window.document.head.append(_styleElement);
	}

	let rule = `@layer style-observer-registered-properties {
		${_layerRules}
	}`;

	if (_styleSheet) {
		_styleSheet.replaceSync(rule);
	}
	else {
		_styleElement.textContent = rule;
	}
}
