<header slot="header" class="wa-split">

# Style Observer

<nav class="wa-gap-m">
	<a href="/api">API</a>
	<a href="/tests">Tests</a>
	<wa-divider vertical></wa-divider>
	<a href="https://github.com/leaverou/style-observer" target="_blank">
		<wa-icon name="github" label="GitHub" family="brands"></wa-icon>
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

A robust, production-ready library to observe CSS property changes.
Detects browser bugs and works around them, so you don't have to.

- <span>✅</span> Observe changes to custom properties
- <span>✅</span> Observe changes to standard properties (except `display`, `transition`, `animation`)
- <span>✅</span> Observe changes on any element (including those in Shadow DOM)
- <span>✅</span> [Lightweight](https://bundlephobia.com/package/style-observer), ESM-only code, with no dependencies
- <span>✅</span> [150+ unit tests](tests) you can run in your browser of choice
- <span>✅</span> Throttling (per element)

## Compatibility

<table>
<thead>
<tr>
	<th>Feature</th>
	<th><wa-icon name="chrome" family="brands"></wa-icon> Chrome</th>
	<th><wa-icon name="safari" family="brands"></wa-icon> Safari</th>
	<th><wa-icon name="firefox" family="brands"></wa-icon> Firefox</th>
	<th>% of global users</th>
</tr>
</thead>
<tbody>
<tr>
	<td>Custom properties</td>
	<td>117</td>
	<td>17.4</td>
	<td>129</td>
	<td><a href="https://caniuse.com/mdn-css_properties_transition-behavior">89%</a></td>
</tr>
<tr>
	<td>Custom properties (registered with an animatable type)</td>
	<td>117</td>
	<td>17.4</td>
	<td>129</td>
	<td>89%</td>
</tr>
<tr>
	<td>Standard properties (discrete)
	<br><small class="compat wa-caption-s">Except <code>display</code>, <code>transition</code>, <code>animation</code></small>
	</td>
	<td>117</td>
	<td>17.4</td>
	<td>129</td>
	<td><a href="https://caniuse.com/mdn-css_properties_transition-behavior">89%</a></td>
</tr>
<tr>
	<td>Standard properties (animatable)</td>
	<td>97</td>
	<td>15.4</td>
	<td>104</td>
	<td>95%</td>
</tr>
</tbody>
</table>

<small class="compat wa-caption-m"><wa-icon name="circle-info" variant="regular"></wa-icon> Observing discrete properties has the same compat as [`transition-behavior`](https://caniuse.com/mdn-css_properties_transition-behavior) i.e. <strong>~90% of global users</strong>
</small>

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

and if you don’t:

```js
import StyleObserver from 'node_modules/style-observer/dist/index.js';
```

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
you need to do **one** of these two things:
1. In JS, call `observer.updateTransition(targets)` to regenerate the `transition` property the observer uses to detect changes.
2. Add `, var(--style-observer-transition, --style-observer-noop)` at the end of your `transition` property. E.g. if instead of `transition: 1s background` you'd set `transition: 1s background, var(--style-observer-transition, --style-observer-noop)`.

</main>
<footer slot=footer>

By [Lea Verou](https://lea.verou.me/) and [Dmitry Sharabin](https://d12n.me/).
</footer>
