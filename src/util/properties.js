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
export function gentleRegisterProperty (property, meta = {}, window = globalThis) {
	let CSS = window.CSS;

	if (
		!property.startsWith("--") ||
		!CSS.registerProperty ||
		!canRegisterProperty(property, window)
	) {
		return;
	}

	let definition = {
		name: property,
		syntax: meta.syntax || "*",
		inherits: meta.inherits ?? true,
	};

	if (meta.initialValue !== undefined) {
		definition.initialValue = meta.initialValue;
	}
	else if (definition.syntax !== "*" && definition.syntax in INITIAL_VALUES) {
		definition.initialValue = INITIAL_VALUES[definition.syntax];
	}

	try {
		CSS.registerProperty(definition);
	}
	catch (e) {
		let error = e;
		let rethrow = true;

		if (e instanceof window.DOMException) {
			if (e.name === "InvalidModificationError") {
				// Property is already registered, which is fine
				rethrow = false;
			}
			else if (e.name === "SyntaxError") {
				// In Safari < 18.2 (where we face the infinite loop bug),
				// there is no way to provide an initial value for a custom property with a syntax of "<string>".
				// There will always be an error: “The given initial value does not parse for the given syntax.”
				// So we try again with universal syntax.
				// We do the same for any other syntax that is not supported.
				definition.syntax = "*";

				try {
					CSS.registerProperty(definition);
					rethrow = false;
				}
				catch (e) {
					error = e;
				}
			}
		}

		if (rethrow) {
			// Re-throw any other errors
			throw new Error(`Failed to register custom property ${property}: ${error.message}`, {
				cause: error,
			});
		}
	}
}

/**
 * Check if a CSS custom property can be registered.
 * @param {string} property - The property to check.
 * @param {Window} [window] - The window to check in.
 * @returns {boolean} Whether the property can be registered.
 */
export function canRegisterProperty (property, window = globalThis) {
	let document = window.document;

	let dummy = document.createElement("div");
	document.body.append(dummy);

	let invalidValue = "foo(bar)";
	dummy.style.setProperty(property, invalidValue); // a value that is invalid for any registered syntax
	let value = getComputedStyle(dummy).getPropertyValue(property);

	let res = false;
	if (value === invalidValue) {
		// We might have either unregistered or registered property with syntax "*".
		// If it's non-inheritable, we can be sure it's registered.
		// But if it's inheritable, it's OK if we (re-)register it with syntax "*" in any case.
		let child = dummy.appendChild(document.createElement("div"));
		let inheritedValue = getComputedStyle(child).getPropertyValue(property);
		res = inheritedValue === invalidValue;
	}

	dummy.remove();

	return res;
}
