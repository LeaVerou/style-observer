# Change Log

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
