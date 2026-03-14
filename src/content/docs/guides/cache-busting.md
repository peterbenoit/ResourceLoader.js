---
title: Cache Busting
description: Force browsers to re-fetch resources by appending a cache-busting query string to URLs.
---

Browsers aggressively cache JavaScript and CSS files. This is great for performance, but it can cause problems when you deploy an update — users may continue seeing the old version. Cache busting forces the browser to fetch a fresh copy by appending a unique query string to the URL.

## Enable Cache Busting

Pass `cacheBusting: true` to append a timestamp to the URL:

```js
ResourceLoader.include(['https://example.com/app.js'], {
  cacheBusting: true,
});
// Actual URL requested: https://example.com/app.js?_=1710000000000
```

The timestamp (`Date.now()`) changes every time, guaranteeing a fresh request.

:::note[Default is off]
`cacheBusting` is `false` by default. It is most useful during development or immediately after a deployment when you need to force a cache invalidation.
:::

---

## Custom Cache-Busting Query String

By default, the query string is `?_=<timestamp>`. Customise it with `cacheBustingQuery`:

```js
// Use a build version number instead of a timestamp
ResourceLoader.include(['https://example.com/app.js'], {
  cacheBusting: true,
  cacheBustingQuery: '?v=2.1.0',
});
// Actual URL: https://example.com/app.js?v=2.1.0
```

```js
// Use a content hash from your build tool
const BUILD_HASH = 'a3f9b2c1';
ResourceLoader.include(['https://example.com/app.js'], {
  cacheBusting: true,
  cacheBustingQuery: `?hash=${BUILD_HASH}`,
});
```

:::caution[URLs with existing query parameters]
If your URL already has a query string (e.g., `https://example.com/app.js?module=true`), the cache-busting query is appended as-is, resulting in `https://example.com/app.js?module=true?_=123` which is **invalid**.

In that case, use `&` as the prefix: `cacheBustingQuery: '&_=1710000000000'`.
:::

---

## `cacheBustingTypes`

By default, cache busting is applied only to `js` and `css` files. Control which file types receive the query string with `cacheBustingTypes`:

```js
// Also cache-bust JSON API calls
ResourceLoader.include([
  'https://example.com/app.js',
  'https://api.example.com/config.json',
  'https://example.com/styles.css',
], {
  cacheBusting: true,
  cacheBustingTypes: ['js', 'css', 'json'],
});
```

To apply cache busting to **all** file types, pass all supported extensions:

```js
ResourceLoader.include(urls, {
  cacheBusting: true,
  cacheBustingTypes: ['js', 'css', 'json', 'jpg', 'png', 'svg'],
});
```

---

## `restrictCacheBustingToLocal`

By default (`restrictCacheBustingToLocal: true`), cache busting is **only applied to URLs that share the same origin** as the current page.

This is a safety feature — appending a cache-busting query to a CDN URL can break CDN caching and result in degraded performance for all users of that CDN:

```js
// Assuming the page is served from https://myapp.example.com:

ResourceLoader.include([
  '/static/app.js',                              // LOCAL  → cache-busted
  'https://myapp.example.com/assets/lib.js',    // LOCAL  → cache-busted
  'https://cdn.jsdelivr.net/npm/vue/dist/vue.js', // EXTERNAL → NOT cache-busted
], {
  cacheBusting: true,
  restrictCacheBustingToLocal: true, // default
});
```

Set `restrictCacheBustingToLocal: false` to apply cache busting to all URLs regardless of origin:

```js
// Cache-bust everything, including external CDN URLs
ResourceLoader.include([
  '/static/app.js',
  'https://cdn.example.com/lib.js',
], {
  cacheBusting: true,
  restrictCacheBustingToLocal: false,
});
```

---

## Decision Table

When is the cache-busting query actually appended?

| `cacheBusting` | `restrictCacheBustingToLocal` | URL is local | `cacheBustingTypes` includes type | Query appended? |
|:-:|:-:|:-:|:-:|:-:|
| `false` | any | any | any | No |
| `true` | `true` | No | any | No |
| `true` | `true` | Yes | No | No |
| `true` | `true` | Yes | Yes | **Yes** |
| `true` | `false` | any | No | No |
| `true` | `false` | any | Yes | **Yes** |

---

## Development vs. Production Recommendations

```js
// Development: aggressive cache busting on all local resources
const isDev = process.env.NODE_ENV === 'development';

ResourceLoader.include(['./app.js', './styles.css'], {
  cacheBusting: isDev,
  cacheBustingQuery: isDev ? `?t=${Date.now()}` : undefined,
});
```

```js
// Production: pin asset versions with a build hash from your CI/CD pipeline
const ASSET_VERSION = window.__ASSET_VERSION__; // injected at build time

ResourceLoader.include(['https://cdn.example.com/app.js'], {
  cacheBusting: !!ASSET_VERSION,
  cacheBustingQuery: `?v=${ASSET_VERSION}`,
  restrictCacheBustingToLocal: false,
});
```
