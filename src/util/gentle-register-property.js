/**
 * Register a CSS custom property if it’s not already registered
 * @param {string} property - Property name
 * @param {Object} [meta] - Property definition
 * @param {string} [meta.syntax]
 * @param {boolean} [meta.inherits]
 * @param {*} [meta.initialValue]
 */
export default function gentleRegisterProperty (property, meta = {}) {
	if (!property.startsWith("--")) {
		return;
	}

	try {
		let definition = {
			name: property,
			syntax: meta.syntax || "*",
			inherits: meta.inherits ?? true,
		};

		if (meta.initialValue) {
			definition.initialValue = meta.initialValue;
		}

		CSS.registerProperty(definition);
	}
	catch (e) {
		// Property is already registered, which is fine
		if (!(e instanceof DOMException && e.name === "InvalidModificationError")) {
			// Re-throw any other errors
			throw new Error(`Failed to register custom property ${ property }: ${ e.message }`, { cause: e });
		}
	}
}
