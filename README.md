# `StyleObserver`

A production-ready library to observe CSS property changes on any element.

✅ Observe (almost [^1]) any property on any element
✅ Lightweight, ESM-only code, with no dependencies
✅ Tests you can run in your browser of choice
✅ Detects browser bugs and works around them
✅ Browser-compatibility: Chrome 117+, Safari 17.4+, Firefox 129 (same as [`transition-behavior`](https://caniuse.com/mdn-css_properties_transition-behavior)) i.e. ~90% of global users. Even wider for non-discrete, non-custom properties.
✅ Optional throttling per element

## Usage

You can first create the observer instance and then observe, like a `MutationObserver`:

```js
import { StyleObserver } from 'style-observer';

const observer = new StyleObserver(callback);

observer.observe(document.querySelectorAll('.my-element'), ['color', '--my-custom-property']);
```

But you can also provide both targets and properties when creating the observer,
which will also call `observe()` for you:

```js
import { StyleObserver } from 'style-observer';

const observer = new StyleObserver(callback, {
	targets: document.querySelectorAll('.my-element'),
	properties: ['color', '--my-custom-property'],
});
```

## Future Work

- Observe pseudo-elements
- Improver integration with existing transitions
- `immediate` convenience option that fires the callback immediately for every observed element
- Option to fire callback at the *end* of a transition rather than the start

## Prior Art

- [css-variable-observer](https://github.com/fluorumlabs/css-variable-observer) by [Artem Godin](https://github.com/fluorumlabs) paved the way,
using an ingenious hack based on `font-variation-settings` to observe CSS property changes.
- Four years, later [Bramus Van Damme](https://github.com/bramus) pioneered a way to do it "properly" in [style-observer](https://github.com/bramus/style-observer),
thanks to [`transition-behavior: allow-discrete`](https://caniuse.com/mdn-css_properties_transition-behavior) becoming Baseline and even [blogged about all the bugs he encountered along the way](https://www.bram.us/2024/08/31/introducing-bramus-style-observer-a-mutationobserver-for-css/).

This is not a fork of either. It was written from scratch and has several differences, including:
- Actually detects browser bugs, so it doesn't need to tread carefully around them
- Integrates better with existing transitions
- Throttling and coalescing of changes


## Limitations

- You cannot observe `transition` and `animation` properties.
- Observing `display` is inconsistent across browsers (see relevant tests).
- You cannot change the `transition`/`transition-*` properties dynamically on elements you are observing after you start observing them.

