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
 * Register a CSS custom property if it’s not already registered.
 * @param {string} property - Property name.
 * @param {Object} [meta] - Property definition.
 * @param {string} [meta.syntax] - Property syntax.
 * @param {boolean} [meta.inherits] - Whether the property inherits.
 * @param {*} [meta.initialValue] - Initial value.
 */
export default function gentleRegisterProperty (property, meta = {}, window = globalThis) {
	let CSS = window.CSS;

	if (!property.startsWith("--") || !CSS.registerProperty) {
		return;
	}

	let initialValue;
	if (meta.initialValue !== undefined) {
		initialValue = meta.initialValue;
	}
	else if (meta.syntax !== "*" && meta.syntax in INITIAL_VALUES) {
		initialValue = INITIAL_VALUES[meta.syntax];
	}

	adoptCSS(
		`@layer style-observer-layer {
			@property ${property} {
				syntax: "${meta.syntax || "*"}";
				inherits: ${meta.inherits ?? true};
				${initialValue ? `initial-value: ${meta.initialValue};` : ""}
			}
		}`,
		window.document,
	);
}
