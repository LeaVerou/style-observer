import adoptCSS from "./adopt-css.js";

/**
 * Register a CSS custom property using @property so that we don’t get an error
 * @param {*} property
 * @param {*} meta
 */
export default function gentleRegisterProperty (property, meta = {}) {
	adoptCSS(`@property ${property} {
		syntax: "${ meta.syntax || "*" }";
		inherits: ${ meta.inherits || true };
		${ meta.initialValue ? `initial-value: ${ meta.initialValue };` : "" }
	}`);
}
