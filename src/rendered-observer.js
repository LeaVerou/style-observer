/**
 * Monitor the presence of an element in the document.
 * This observer fires the callback in situations like:
 * - The element is added to the DOM
 * - The element gets slotted or its slot starts existing (but not when moved to another slot)
 * - The element becomes visible from display: none
 */

/**
 * Documents to IntersectionObserver instances
 * @type {WeakMap<Document, IntersectionObserver>}
 */
const intersectionObservers = new WeakMap();

/**
 * Elements observed for which their IO has not yet fired
 * @type {WeakSet<Element>}
 **/
const uninitialized = new WeakSet();

export default class RenderedObserver {
	/**
	 * All currently observed targets
	 * @type {WeakSet<Element>}
	 */
	#targets = new Set();

	constructor (callback) {
		this.callback = callback;
	}

	/**
	 * Begin observing the presence of an element.
	 * @param {Element} element - The element to observe.
	 */
	observe (element) {
		let doc = element.ownerDocument;
		let io = intersectionObservers.get(doc);

		if (!io) {
			io = new IntersectionObserver(
				entries => {
					let targets = [];
					for (const entry of entries) {
						if (uninitialized.has(entry.target)) {
							uninitialized.delete(entry.target);
						}
						else if (entry.isIntersecting) {
							targets.push(entry.target);
						}
					}

					if (targets.length > 0) {
						this.callback(targets.map(target => ({ target })));
					}
				},
				{ root: doc.documentElement },
			);

			intersectionObservers.set(doc, io);
		}

		uninitialized.add(element);
		this.#targets.add(element);
		io.observe(element);
	}

	/**
	 * Stop observing the presence of an element.
	 * @param {Element} [element] - The element to stop observing. If not provided, all targets will be unobserved.
	 */
	unobserve (element) {
		if (!element) {
			// Unobserve all targets
			for (const target of this.#targets) {
				this.unobserve(target);
			}
			return;
		}

		let doc = element.ownerDocument;
		let io = intersectionObservers.get(doc);

		io?.unobserve(element);
		uninitialized.delete(element);
		this.#targets.delete(element);
	}
}
