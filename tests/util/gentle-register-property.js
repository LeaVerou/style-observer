/**
 * Register a CSS custom property if it’s not already registered.
 * Like the src version, but less graceful (we want to know when it fails) and with fewer conveniences
 * @param {string} property - Property name.
 * @param {Object} [meta] - Property definition.
 * @param {string} [meta.syntax] - Property syntax.
 * @param {boolean} [meta.inherits] - Whether the property inherits.
 * @param {*} [meta.initialValue] - Initial value.
 * @param {Window} [window] - Window to register the property in.
 * @returns {boolean} - Whether the property was successfully registered.
 */
export default function gentleRegisterProperty (property, meta = {}, window = globalThis) {
	if (!property.startsWith("--") || !window.CSS?.registerProperty) {
		return false;
	}

	try {
		window.CSS.registerProperty({
			name: property,
			inherits: meta.inherits ?? true,
			syntax: meta.syntax,
			initialValue: meta.initialValue,
		});
		return true;
	}
	catch (e) {
		if (e instanceof DOMException) {
			if (e.name === "InvalidModificationError") {
				// Property is already registered, which is fine
				return false;
			}
		}

		// Rethrow any other errors
		throw e;
	}
}
