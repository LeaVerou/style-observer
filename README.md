# `StyleObserver`

Like `MutationObserver`, `ResizeObserver` etc for CSS property changes.

Prior art:
- [css-variable-observer](https://github.com/fluorumlabs/css-variable-observer) by [Artem Godin](https://github.com/fluorumlabs) paved the way,
using an ingenious hack based on `font-variation-settings` to observe CSS property changes.
- Four years, later [Bramus Van Damme](https://github.com/bramus) pioneered a way to do it "properly" in [style-observer](https://github.com/bramus/style-observer),
thanks to [`transition-behavior: allow-discrete`](https://caniuse.com/mdn-css_properties_transition-behavior) becoming Baseline and even [blogged about all the bugs he encountered along the way](https://www.bram.us/2024/08/31/introducing-bramus-style-observer-a-mutationobserver-for-css/).

This is not a fork for either, it is written from scratch and has several differences:
- Integrates better with existing transitions
- Actually detects the bugs, so it doesn't need to tread carefully around them
- Follows an API design that is more consistent with other observers on the web platform.


TODO:
- Combines the best of both: it does it properly if `transition-behavior` is supported, and falls back to the hack if not.
- Observe pseudo-elements
- Throttles property changes
- Detect whether transitionstart fires upfront

Limitations:
- You cannot observe `transition` and `animation` properties.
- Existing (static) values are preserved, but you cannot change the `transition` or `font-variation-settings` properties dynamically on the element you are observing.

Browser bugs:
- Chrome will not fire a transition event if the property is not registered (even with a syntax of `*`)

Edge cases to test:
- Nested targets
- Multiple observers on the same targets
