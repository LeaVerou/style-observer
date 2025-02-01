<header slot="header" class="wa-split">

# Style Observer

<nav class="wa-gap-m">
	<a href="/api">API</a>
	<a href="/tests">Tests</a>
	<wa-divider orientation="vertical"></wa-divider>
	<a href="https://github.com/leaverou/style-observer" target="_blank">
		<wa-icon name="github" label="GitHub" family="brands"></wa-icon>
	</a>
	<a href="https://www.npmjs.com/package/style-observer" target="_blank">
		<wa-icon name="npm" label="NPM" family="brands"></wa-icon>
	</a>
</nav>

</header>

<aside slot="aside">

- [Install](#install)
- [Usage](#usage)
- [Future Work](#future-work)
- [Prior Art](#prior-art)
- [Limitations & Caveats](#limitations--caveats)

</aside>
<main>

[![npm](https://img.shields.io/npm/v/style-observer)](https://www.npmjs.com/package/style-observer)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/style-observer)](https://bundlephobia.com/package/style-observer)

A robust, production-ready library to observe CSS property changes on any element.
Detects browser bugs and works around them, so you don't have to.

<wa-icon name="chrome" family="brands">Chrome</wa-icon> **117+**
<wa-icon name="safari" family="brands">Safari</wa-icon> **17.4+**
<wa-icon name="firefox" family="brands">Firefox</wa-icon> **129**

<small>Same compat as [`transition-behavior`](https://caniuse.com/mdn-css_properties_transition-behavior) i.e. <strong>~90% of global users</strong></small>

- ✅ Observe ([almost](#limitations--caveats)) any property on any element
- ✅ [Lightweight](https://bundlephobia.com/package/style-observer), ESM-only code, with no dependencies
- ✅ [Tests](tests) you can run in your browser of choice to verify compatibility
- ✅ Throttling (per element)

## Install

The quickest way is to just include straight from the [Netlify](https://www.netlify.com/) CDN:

```js
import StyleObserver from 'https://observe.style/index.js';
```

This will always point to the latest version, so it may be a good idea to eventually switch to a local version that you can control.
E.g. you can use npm:

```sh
npm install style-observer
```

and then, if you use a bundler like Rollup or Webpack:

```js
import StyleObserver from 'style-observer';
```

and if you don’t, you can just include the file from `node_modules/style-observer/dist/index.js`.

## Usage

You can first create the observer instance and then observe, like a `MutationObserver`:

```js
import StyleObserver from 'style-observer';

const observer = new StyleObserver(callback);
const properties = ['color', '--my-custom-property'];
const targets = document.querySelectorAll('.my-element');
observer.observe(targets, properties);
```

Alternatively, you can provide both targets and properties when creating the observer,
which will also call `observe()` for you:

```js
import StyleObserver from 'style-observer';

const observer = new StyleObserver(callback, {
	targets: document.querySelectorAll('.my-element'),
	properties: ['color', '--my-custom-property'],
});
```

Both targets and properties can be either a single value or an iterable.

Note that the observer will not fire immediately for the initial state of the elements.

## Future Work

- Observe pseudo-elements
- `immediate` convenience option that fires the callback immediately for every observed element
- Option to fire callback at the *end* of a transition
- Option to fire callback *during* transitions

## Prior Art

- [css-variable-observer](https://github.com/fluorumlabs/css-variable-observer) by [Artem Godin](https://github.com/fluorumlabs) paved the way,
using an ingenious hack based on `font-variation-settings` to observe CSS property changes.
- Four years, later [Bramus Van Damme](https://github.com/bramus) pioneered a way to do it "properly" in [style-observer](https://github.com/bramus/style-observer),
thanks to [`transition-behavior: allow-discrete`](https://caniuse.com/mdn-css_properties_transition-behavior) becoming Baseline and even [blogged about all the bugs he encountered along the way](https://www.bram.us/2024/08/31/introducing-bramus-style-observer-a-mutationobserver-for-css/).

This is not a fork of either. It was written from scratch and has several differences, including:
- Actually detects browser bugs, so it doesn't need to tread carefully around them
- Integrates better with existing transitions
- Throttling and coalescing of changes

[Read the blog post](https://lea.verou.me/2025/style-observer/) for more details.

## Limitations & Caveats

### Transitions & Animations

- You cannot observe `transition` and `animation` properties.
- You cannot observe changes caused by CSS animations or transitions.

### Observing `display`

Observing `display` is inconsistent across browsers (see [relevant tests](tests/?test=display)):

| Rule | Chrome | Firefox | Safari | Safari (iOS) | Samsung Internet |
| --- | --- | --- | --- | --- | --- |
| From `display: none` | ❌ | ❌ | ❌ | ❌ | ❌ |
| To `display: none` | ❌ | ❌ | ✅ | ✅ | ❌ |
| From not `none` to not `none` |  ✅ | ❌ | ✅ | ✅ | ✅ |

### Changing `transition` properties after observing

If you change the `transition`/`transition-*` properties dynamically on elements you are observing after you start observing them,
you need to call `observer.updateTransition(targets)` to regenerate the `transition` property the observer uses to detect changes.
Or just tuck `, var(--style-observer-transition, all)` at the end of your `transition` property, and then you don’t need to worry about it.

</main>
<footer slot=footer>

By [Lea Verou](https://lea.verou.me/) and [Dmitry Sharabin](https://d12n.me/).
</footer>
