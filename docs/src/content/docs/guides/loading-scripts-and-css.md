---
title: Loading Scripts & CSS
description: Load JavaScript and CSS files dynamically with full control over DOM placement, deduplication, and security attributes.
---

import { Aside } from '@astrojs/starlight/components';

ResourceLoader.js loads JavaScript via `<script>` elements and CSS via `<link rel="stylesheet">` elements injected into the DOM. This guide covers all the behavioral details you need for production use.

## Basic Usage

### Load a Single Script

```js
ResourceLoader.include(['https://cdn.example.com/library.js'])
  .then((results) => {
    console.log('Script loaded:', results[0].value); // the URL
    // Library is now available globally — use it here
  })
  .catch((error) => {
    console.error('Load failed:', error);
  });
```

### Load a Single Stylesheet

```js
ResourceLoader.include(['https://cdn.example.com/styles.css'])
  .then(() => {
    console.log('Styles applied!');
  });
```

### Load Multiple Resources Together

You can mix JS, CSS, and other types in a single `include()` call. All resources load concurrently (up to [`maxConcurrency`](/guides/concurrency-and-priority/)) and the Promise resolves when every resource has completed:

```js
ResourceLoader.include([
  'https://cdn.example.com/normalize.css',
  'https://cdn.example.com/app.css',
  'https://cdn.example.com/vendor.js',
  'https://cdn.example.com/app.js',
])
.then((results) => {
  // results is an array — one entry per URL
  // [
  //   { status: 'fulfilled', value: 'https://cdn.example.com/normalize.css' },
  //   { status: 'fulfilled', value: 'https://cdn.example.com/app.css' },
  //   { status: 'fulfilled', value: 'https://cdn.example.com/vendor.js' },
  //   { status: 'fulfilled', value: 'https://cdn.example.com/app.js' },
  // ]
  console.log(`Loaded ${results.length} resources`);
  initApp();
});
```

:::note
When loading multiple scripts that depend on each other (e.g., a plugin that requires jQuery), use **two separate `include()` calls** chained with `.then()` to guarantee load order:

```js
// Load jQuery first, then the plugin that depends on it
await ResourceLoader.include(['https://cdn.example.com/jquery.js']);
await ResourceLoader.include(['https://cdn.example.com/jquery-plugin.js']);
```
:::

---

## DOM Placement

### `appendToBody`

By default, scripts are inserted into `<head>`. Set `appendToBody: true` to insert them at the end of `<body>` instead:

```js
ResourceLoader.include(['https://cdn.example.com/app.js'], {
  appendToBody: true,
});
```

Use `appendToBody: true` when your script references DOM elements that must exist before the script runs, and you are loading the script before the page finishes rendering.

### `deferScriptsUntilReady`

By default (`deferScriptsUntilReady: true`), scripts wait for the `DOMContentLoaded` event before being inserted. This prevents scripts from executing before the DOM is ready.

If the DOM is already ready when `include()` is called (which is almost always the case in practice), this option has no effect. Set it to `false` only if you need scripts to be inserted immediately without any DOMContentLoaded check:

```js
ResourceLoader.include(['https://cdn.example.com/app.js'], {
  deferScriptsUntilReady: false,
});
```

---

## Deduplication

ResourceLoader.js checks whether a resource with the same URL is already present in the DOM before inserting a new element. If a `<script src="...">` or `<link href="...">` element matching the URL already exists, the load is skipped and the Promise resolves immediately.

This means calling `include()` multiple times with the same URL is safe — the script or stylesheet will only ever be loaded once per page:

```js
// Call include() twice with the same URL — no duplicate loads
await ResourceLoader.include(['https://cdn.example.com/lib.js']);
await ResourceLoader.include(['https://cdn.example.com/lib.js']); // no-op, already in DOM
```

---

## Security: SRI and Crossorigin

### Subresource Integrity (SRI)

When loading scripts or stylesheets from a third-party CDN, you should use [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) hashes to verify that the file has not been tampered with.

Pass the `integrity` hash via the `attributes` option:

```js
ResourceLoader.include([
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
], {
  crossorigin: 'anonymous',
  attributes: {
    integrity: 'sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD',
  },
});
```

:::caution[Get SRI hashes from the CDN]
Most CDNs (jsDelivr, cdnjs, unpkg) show SRI hashes alongside their copy buttons. Always get the hash from the CDN directly — never compute it yourself from a locally downloaded file.
:::

### `crossorigin`

The `crossorigin` attribute is required when using SRI for cross-origin resources. Valid values are:

| Value | Behavior |
|-------|----------|
| `false` (default) | No `crossorigin` attribute set |
| `'anonymous'` | Sends requests without cookies or credentials |
| `'use-credentials'` | Sends cookies and credentials with requests |

For CDN resources with SRI, use `'anonymous'` unless the CDN requires credentials.

:::caution
The library logs a warning if you set `integrity` without also setting `crossorigin`. SRI requires both attributes to work correctly.
:::

---

## `removeFailedElements`

When a `<script>` or `<link>` element fails to load (e.g., the file is not found), ResourceLoader.js removes the element from the DOM by default (`removeFailedElements: true`). This prevents half-loaded, broken element references from persisting on the page.

Set to `false` if you want the failed element to remain in the DOM for debugging:

```js
ResourceLoader.include(['https://cdn.example.com/missing.css'], {
  removeFailedElements: false, // Leave the failed <link> element in the DOM
  onError: (error, url) => {
    console.error(`Failed: ${url}`, error);
  },
});
```

---

## Using `async/await`

All examples work equally well with `async/await`:

```js
async function loadDependencies() {
  try {
    await ResourceLoader.include([
      'https://cdn.example.com/styles.css',
      'https://cdn.example.com/vendor.js',
    ]);
    console.log('Dependencies ready');
    initApp();
  } catch (error) {
    if (error.type === 'aggregate') {
      error.results
        .filter(r => r.status === 'rejected')
        .forEach(r => console.error(`Failed: ${r.url}`, r.reason));
    }
  }
}

loadDependencies();
```

---

## Full Example: Conditionally Load a Library

A common pattern is to load a library only if it hasn't been loaded yet:

```js
async function ensureChartsLoaded() {
  const chartUrl = 'https://cdn.example.com/chart.js';

  if (ResourceLoader.getResourceState(chartUrl) === 'loaded') {
    return; // Already loaded, nothing to do
  }

  await ResourceLoader.include([chartUrl], {
    retries: 2,
    timeout: 10000,
  });

  // Chart.js is now available globally
  renderChart();
}
```
