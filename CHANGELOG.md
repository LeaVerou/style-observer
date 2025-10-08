# Change Log

## v0.1.2 (2025-10-08)

### Improvements

- Remove the `transitionrun` event listener if the browser is not affected by the `transitionrun` event loop bug by [@DmitrySharabin](https://github.com/DmitrySharabin) in [#127](https://github.com/LeaVerou/style-observer/pull/127).
- Improve browser bug detection by [@LeaVerou](https://github.com/LeaVerou) and [@DmitrySharabin](https://github.com/DmitrySharabin) in [#129](https://github.com/LeaVerou/style-observer/pull/129).
- Register properties by placing the corresponding `@property` rules in a CSS layer instead of less permissive `CSS.registerProperty` by [@DmitrySharabin](https://github.com/DmitrySharabin) in [#132](https://github.com/LeaVerou/style-observer/pull/132). The user’s rules now have higher priority, and they can redefine already registered properties if needed.

### Tests

- Test that Style Observer doesn't fire pointlessly immediately after starting observing by [@DmitrySharabin](https://github.com/DmitrySharabin) in [#98](https://github.com/LeaVerou/style-observer/pull/98).
- Test that Style Observer correctly works with disconnected elements by [@DmitrySharabin](https://github.com/DmitrySharabin) in [#99](https://github.com/LeaVerou/style-observer/pull/99).
- Fix race conditions in the reflow tests by [@DmitrySharabin](https://github.com/DmitrySharabin) in [#132](https://github.com/LeaVerou/style-observer/pull/132).
- Fix bug with `isRegisteredProperty()` argument by [@DmitrySharabin](https://github.com/DmitrySharabin) in [6e73d42](https://github.com/LeaVerou/style-observer/commit/6e73d427528ecc86d6c4c56d8c2aca8b5dc42ecd).

### Other

- Add an MIT licence so people can freely use the library in their projects by [@LeaVerou](https://github.com/LeaVerou) in [a1a66ac](https://github.com/LeaVerou/style-observer/commit/a1a66acee7fd2dbdbe9738ff37bbc5eae7407864).

**Full Changelog:** [0.1.1...0.1.2](https://github.com/LeaVerou/style-observer/compare/0.1.1...0.1.2)

## v0.1.1 (2025-06-01)

### Improvements

- Make the Style Observer package work correctly in Webpack by [@web-padawan](https://github.com/web-padawan) in [#122](https://github.com/LeaVerou/style-observer/pull/122).
- Detect the [Safari adopted stylesheet bug](https://bugs.webkit.org/show_bug.cgi?id=293556) and work around it by [@DmitrySharabin](https://github.com/DmitrySharabin) and [@LeaVerou](https://github.com/LeaVerou) in [#121](https://github.com/LeaVerou/style-observer/pull/121) and [#124](https://github.com/LeaVerou/style-observer/pull/124).

### Tests

- Skip Shadow DOM tests in browsers that don't support them by [@DmitrySharabin](https://github.com/DmitrySharabin) in [#123](https://github.com/LeaVerou/style-observer/pull/123).

**Full Changelog:** [0.1.0...0.1.1](https://github.com/LeaVerou/style-observer/compare/0.1.0...0.1.1)

### New Contributors

- [@web-padawan](https://github.com/web-padawan) made their first contribution in [#122](https://github.com/LeaVerou/style-observer/pull/122)

## v0.1.0 (2025-05-22)

### Optimizations

- Use adopted stylesheets (if supported) for shadow root hosts instead of inline styles (by [@LeaVerou](https://github.com/LeaVerou) in [#110](https://github.com/LeaVerou/style-observer/pull/110); tests by [@DmitrySharabin](https://github.com/DmitrySharabin) in [#112](https://github.com/LeaVerou/style-observer/pull/112)).

### Bugfixes

- Do not break in DOM-less environments, like NodeJS (by [@benface](https://github.com/benface) in [#115](https://github.com/LeaVerou/style-observer/pull/115)).
- Setting `transition-property: none` should not stop properties observation (by [@LeaVerou](https://github.com/LeaVerou) in [3a0f0d9](https://github.com/LeaVerou/style-observer/commit/3a0f0d988cfd9ea0601774b573886e5bc2890ee5) and [@DmitrySharabin](https://github.com/DmitrySharabin) in [#118](https://github.com/LeaVerou/style-observer/pull/118)).

#### TypeScript

- Make options optional in `StyleObserver()` and `ElementStyleObserver()` constructors (by [@LeaVerou](https://github.com/LeaVerou) in [f14bb02](https://github.com/LeaVerou/style-observer/commit/f14bb0264ef2f47680b6991e923ba63031ab6547)).
- Add type overloads for `observe()` and `unobserve()` so that TypeScript allows providing their arguments in any order (by [@LeaVerou](https://github.com/LeaVerou) in [151b0c2](https://github.com/LeaVerou/style-observer/commit/151b0c24e38e4e227215f3198e9f92bfdc8f7e1f) and [@DmitrySharabin](https://github.com/DmitrySharabin) in [#116](https://github.com/LeaVerou/style-observer/pull/116)).

**Full Changelog:** [0.0.9...0.1.0](https://github.com/LeaVerou/style-observer/compare/0.0.9...0.1.0)

### New Contributors

- [@benface](https://github.com/benface) made their first contribution in [#115](https://github.com/LeaVerou/style-observer/pull/115)
