<header slot=header>

# Style Observer

[![npm](https://img.shields.io/npm/v/style-observer)](https://www.npmjs.com/package/style-observer)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/style-observer)](https://bundlephobia.com/package/style-observer)
</header>

A production-ready library to observe CSS property changes on any element.

- ✅ Observe ([almost](#limitations)) any property on any element
- ✅ Lightweight, ESM-only code, with no dependencies
- ✅ [Tests](tests) you can run in your browser of choice to verify compatibility
- ✅ Detects browser bugs and works around them
- ✅ Browser-compatibility: **Chrome 117+, Safari 17.4+, Firefox 129** (same as [`transition-behavior`](https://caniuse.com/mdn-css_properties_transition-behavior)) i.e. ~90% of global users.
- ✅ Optional throttling (per element)

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

With either syntax:
- ✅ Targets can be either a single element, or an iterable of elements
- ✅ Properties can be either a single property, or an iterable of properties


## Future Work

- Observe pseudo-elements
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


## Limitations & Caveats

### Transitions & Animations

- You cannot observe `transition` and `animation` properties.
- You cannot observe changes caused by CSS animations or transitions.

### Observing `display`

Observing `display` is inconsistent across browsers (see [relevant tests](tests/display)):

| Rule | Chrome | Firefox | Safari | Safari (iOS) | Samsung Internet |
| --- | --- | --- | --- | --- | --- |
| From `display: none` | ❌ | ❌ | ❌ | ❌ | ❌ |
| To `display: none` | ❌ | ❌ | ✅ | ✅ | ❌ |
| From not `none` to not `none` |  ✅ | ❌ | ✅ | ✅ | ✅ |

### Changing `transition` properties after observing

If you change the `transition`/`transition-*` properties dynamically on elements you are observing after you start observing them,
you need to call `observer.updateTransition(targets)` to regenerate the `transition` property the observer uses to detect changes.
Or just tuck `, var(--style-observer-transition, all)` at the end of your `transition` property, and then you don’t need to worry about it.

