---
title: Options Reference
description: Complete reference for all options accepted by ResourceLoader.include().
---

All options are passed as the second argument to [`include()`](/api/include/). Every option is optional.

## Quick Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| [`logLevel`](#loglevel) | `'silent' \| 'warn' \| 'verbose'` | `'warn'` | Logging verbosity |
| [`timeout`](#timeout) | `number` | `10000` | Load timeout in milliseconds |
| [`retries`](#retries) | `number` | `0` | Retry attempts on failure |
| [`retryDelay`](#retrydelay) | `number` | `1000` | Milliseconds between retries |
| [`maxConcurrency`](#maxconcurrency) | `number` | `3` | Max simultaneous loads |
| [`priority`](#priority) | `number` | `0` | Load order priority (higher = first) |
| [`cacheBusting`](#cachebusting) | `boolean` | `false` | Append cache-busting query string |
| [`cacheBustingQuery`](#cachebustingquery) | `string` | `'?_=<timestamp>'` | The query string to append |
| [`cacheBustingTypes`](#cachebustingtypes) | `string[]` | `['js', 'css']` | File types to apply cache busting |
| [`restrictCacheBustingToLocal`](#restrictcachebustingtolocal) | `boolean` | `true` | Only bust cache for same-origin URLs |
| [`onSuccess`](#onsuccess) | `function` | — | Per-resource success callback |
| [`onError`](#onerror) | `function` | — | Per-resource error callback |
| [`appendToBody`](#appendtobody) | `boolean` | `false` | Append scripts to `<body>` |
| [`deferScriptsUntilReady`](#deferscriptsuntilready) | `boolean` | `true` | Defer scripts until DOMContentLoaded |
| [`removeFailedElements`](#removefailedelements) | `boolean` | `true` | Remove DOM elements on failure |
| [`crossorigin`](#crossorigin) | `false \| 'anonymous' \| 'use-credentials'` | `false` | crossorigin attribute value |
| [`attributes`](#attributes) | `object` | `{}` | Additional element attributes |

---

## Option Details

### `logLevel`

**Type:** `'silent' | 'warn' | 'verbose'`
**Default:** `'warn'`

Sets the logging verbosity for this call. Also updates the global level for subsequent calls.

```js
ResourceLoader.include([url], { logLevel: 'verbose' });
```

See [`setLoggingLevel()`](/api/set-logging-level/) for more details.

---

### `timeout`

**Type:** `number` (milliseconds)
**Default:** `10000`

Maximum time to wait for a resource to load. If the timeout is exceeded, the load is aborted with `error.type === 'timeout'`. Each resource and each retry attempt gets its own independent timeout clock.

```js
ResourceLoader.include([url], { timeout: 5000 }); // 5 seconds
```

---

### `retries`

**Type:** `number`
**Default:** `0`

Number of additional attempts after the first failure. A value of `3` means 4 total attempts (1 initial + 3 retries).

```js
ResourceLoader.include([url], { retries: 3 });
```

---

### `retryDelay`

**Type:** `number` (milliseconds)
**Default:** `1000`

Time to wait between retry attempts. Requires `retries > 0` to have any effect.

```js
ResourceLoader.include([url], { retries: 2, retryDelay: 2000 });
```

---

### `maxConcurrency`

**Type:** `number`
**Default:** `3`

Maximum number of resources that load simultaneously. Additional resources queue and start as slots become available.

```js
ResourceLoader.include(manyUrls, { maxConcurrency: 5 });
```

---

### `priority`

**Type:** `number`
**Default:** `0`

Sort order for the load queue. Higher numbers load before lower numbers. Sorting happens across separate `include()` calls before the concurrency queue runs.

```js
// These load before lower-priority calls
ResourceLoader.include([critical], { priority: 10 });
ResourceLoader.include([analytics], { priority: 0 });
```

---

### `cacheBusting`

**Type:** `boolean`
**Default:** `false`

When `true`, appends a cache-busting query string to resource URLs (subject to `cacheBustingTypes` and `restrictCacheBustingToLocal`).

```js
ResourceLoader.include([url], { cacheBusting: true });
// URL becomes: https://example.com/app.js?_=1710000000000
```

---

### `cacheBustingQuery`

**Type:** `string`
**Default:** `'?_=<timestamp>'`

The query string to append when `cacheBusting` is enabled. Override this to use a version number or content hash instead of a timestamp.

```js
ResourceLoader.include([url], {
  cacheBusting: true,
  cacheBustingQuery: '?v=2.1.0',
});
```

---

### `cacheBustingTypes`

**Type:** `string[]`
**Default:** `['js', 'css']`

File extensions that receive the cache-busting query string when `cacheBusting` is `true`.

```js
ResourceLoader.include([url], {
  cacheBusting: true,
  cacheBustingTypes: ['js', 'css', 'json'],
});
```

---

### `restrictCacheBustingToLocal`

**Type:** `boolean`
**Default:** `true`

When `true`, cache busting is only applied to URLs that share the same origin as the current page. Set to `false` to apply it to all URLs, including external CDNs.

```js
ResourceLoader.include([url], {
  cacheBusting: true,
  restrictCacheBustingToLocal: false, // Apply to CDN URLs too
});
```

---

### `onSuccess`

**Type:** `function`
**Default:** none

Callback invoked once per resource as each one finishes loading. The argument varies by resource type:

| Resource type | Argument |
|---------------|----------|
| JS, CSS, images | URL string |
| JSON | Parsed JavaScript object |
| Audio, video, PDF, binary | `Blob` object |
| Fonts | `undefined` |

```js
ResourceLoader.include([url], {
  onSuccess: (data) => {
    if (typeof data === 'string') console.log('Loaded URL:', data);
    else if (data instanceof Blob) console.log('Loaded blob:', data.type);
    else console.log('Loaded data:', data);
  },
});
```

---

### `onError`

**Type:** `function`
**Default:** none

Callback invoked when a resource fails (after all retries are exhausted). Receives two arguments:

- `error`: `{ type: 'network' | 'timeout' | 'abort' | 'unsupported', message: string }`
- `url`: The URL that failed

```js
ResourceLoader.include([url], {
  onError: (error, url) => {
    console.error(`[${error.type}] ${url}: ${error.message}`);
  },
});
```

---

### `appendToBody`

**Type:** `boolean`
**Default:** `false`

When `true`, `<script>` elements are appended to `<body>` instead of `<head>`. Has no effect on CSS, JSON, or other types.

```js
ResourceLoader.include(['https://cdn.example.com/app.js'], {
  appendToBody: true,
});
```

---

### `deferScriptsUntilReady`

**Type:** `boolean`
**Default:** `true`

When `true`, script elements are not inserted until the `DOMContentLoaded` event has fired. If the DOM is already ready when `include()` is called, this has no visible effect.

```js
ResourceLoader.include([url], { deferScriptsUntilReady: false });
```

---

### `removeFailedElements`

**Type:** `boolean`
**Default:** `true`

When `true`, failed `<script>`, `<link>`, and `<img>` elements are removed from the DOM automatically. Set to `false` to leave them for debugging.

```js
ResourceLoader.include([url], { removeFailedElements: false });
```

---

### `crossorigin`

**Type:** `false | 'anonymous' | 'use-credentials'`
**Default:** `false`

Sets the `crossorigin` attribute on `<script>` and `<link>` elements. Required when using Subresource Integrity (`attributes.integrity`).

```js
ResourceLoader.include([url], {
  crossorigin: 'anonymous',
  attributes: { integrity: 'sha384-...' },
});
```

---

### `attributes`

**Type:** `object`
**Default:** `{}`

Additional HTML attributes to apply to the created DOM element. The most commonly used attribute is `integrity` for SRI:

```js
ResourceLoader.include(['https://cdn.example.com/lib.js'], {
  crossorigin: 'anonymous',
  attributes: {
    integrity: 'sha384-abc123...',
    // Any other valid attribute for the element type:
    // nonce: 'abc123',
    // referrerpolicy: 'no-referrer',
  },
});
```
