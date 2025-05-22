# v0.1.0 (2025-05-22)

## Optimization

- Use adopted stylesheets (if supported) for shadow root hosts instead of inline styles (by @LeaVerou in #110; tests by @DmitrySharabin in #112).
- Improve support for DOMless environments, like NodeJS (by @benface in #115).

## Bug fixes

- Setting `transition-property: none` should not stop properties observation (by @LeaVerou in 3a0f0d988cfd9ea0601774b573886e5bc2890ee5 and @DmitrySharabin in #118).

## Better integration with TypeScript

- Make options optional in `StyleObserver()` and `ElementStyleObserver()` constructors (by @LeaVerou in f14bb0264ef2f47680b6991e923ba63031ab6547).
- Add type overloads for `observe()` and `unobserve()` so that TypeScript allows providing their arguments in any order (by @LeaVerou in 151b0c24e38e4e227215f3198e9f92bfdc8f7e1f and @DmitrySharabin in #116).

**Full Changelog:** 0.0.9...0.1.0

## New Contributors

- @benface made their first contribution in #115
