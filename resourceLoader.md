# ResourceLoader.js — Technical Overview

## What Is ResourceLoader.js?

ResourceLoader.js is a lightweight, zero-dependency JavaScript library for dynamically loading web resources at runtime. It provides a single, unified API — `ResourceLoader.include()` — that handles every common resource type through one consistent Promise-based interface.

Instead of writing bespoke loaders for scripts, stylesheets, JSON data, fonts, images, audio, video, or binary files, you call one method and get back a Promise that resolves when everything is ready — or rejects with structured error information so you know exactly what failed and why.

```js
await ResourceLoader.include([
  'https://example.com/app.css',
  'https://example.com/app.js',
  'https://api.example.com/config.json',
]);
// All three are loaded. Start your app.
```

The library is a single JavaScript file (~17 KB), MIT-licensed, and works in any modern browser with no build step required.

---

## Why I Built It

When building web pages and apps — particularly pages that integrate third-party scripts, stylesheets, dynamic data, or media — loading resources programmatically is surprisingly messy. The browser offers several different mechanisms depending on resource type (`<script>` elements, `<link>` elements, `fetch()`, `FontFace`, `Image`), each with its own quirks around load events, error handling, and caching.

The recurring problems I kept solving across projects were:

- **No unified API.** Loading a JS file requires a `<script>` element and an `onload` handler. Loading JSON requires `fetch()`. Loading a font requires the `FontFace` API. Gluing these together is repetitive boilerplate every time.
- **No built-in retries.** Transient network failures silently fail. Adding retry logic manually is non-trivial.
- **No concurrency control.** Firing dozens of parallel loads at once can degrade browser performance, but throttling them manually is tedious.
- **No state tracking.** Without a registry, it is easy to accidentally load the same resource twice if multiple parts of an application call a loader independently.
- **No structured errors.** Native load failures surface as opaque DOM events or raw `fetch` rejections with inconsistent shapes.

ResourceLoader.js solves all of these in a single library with a clean, Promise-based interface so I (and anyone else) can stop re-solving the same problem on every project.

---

## Who It Is For

ResourceLoader.js is aimed at **front-end developers** who work directly with browser JavaScript — particularly those who:

- Build **multi-page or vanilla JS applications** that need to load assets programmatically (dashboards, CMSs, dynamic page builders)
- Work on **embeddable widgets or plugins** that must safely load their own assets without relying on a framework
- Prototype or build **demos and CodePens** where a dependency manager is overkill
- Are **migrating legacy pages** that were not built with a bundler and need dynamic resource management
- Want a **drop-in utility** for resource loading without adopting a full framework or build pipeline

It is intentionally not aimed at bundler-based SPAs (React, Vue, Svelte, Angular) where module imports and code splitting handle asset loading. Those environments have better purpose-built solutions. ResourceLoader.js is for the browser script tag world.

---

## Core Features

### Universal Resource Support

ResourceLoader.js automatically detects the resource type from the file extension and uses the correct loading mechanism:

| Category     | Extensions                        | Loaded via              |
|--------------|-----------------------------------|-------------------------|
| Scripts      | `.js`                             | `<script>` element      |
| Stylesheets  | `.css`                            | `<link>` element        |
| JSON data    | `.json`                           | `fetch()` + `response.json()` |
| Images       | `.jpg`, `.png`, `.gif`, `.svg`, `.webp` | `<img>` element   |
| Fonts        | `.woff`, `.woff2`                 | `FontFace` API          |
| Audio        | `.mp3`, `.ogg`, `.wav`            | `fetch()` + `response.blob()` |
| Video        | `.mp4`, `.avi`, `.webm`           | `fetch()` + `response.blob()` |
| Binary / PDF | `.pdf`, `.zip`, `.bin`            | `fetch()` + `response.blob()` |

### Promise-Based API

Every call returns a standard Promise. Use `.then()/.catch()` or `async/await`. On success, the Promise resolves with an array of results. On failure, it rejects with a structured aggregate error that identifies every individual failure.

```js
try {
  const results = await ResourceLoader.include(['app.js', 'data.json']);
} catch (err) {
  // err.type === 'aggregate'
  // err.results — per-resource outcome for every URL
}
```

### Retries and Timeouts

Configure how many times a failed load should be retried and how long each attempt may run before timing out:

```js
ResourceLoader.include([url], {
  retries: 3,        // Up to 3 additional attempts
  retryDelay: 2000,  // 2-second pause between retries
  timeout: 5000,     // Abort each attempt after 5 seconds
});
```

Each retry gets its own fresh timeout clock. `network` and `timeout` errors are automatically retried; `unsupported` errors are not.

### Concurrency Control

Limit how many resources load simultaneously to avoid saturating the network or the browser's connection pool:

```js
ResourceLoader.include(urls, { maxConcurrency: 4 });
```

The default is `3`. Resources queue internally and load as slots become available.

### Priority Queuing

When resources are queued due to concurrency limits, higher-priority resources load first:

```js
ResourceLoader.include(['critical.js'], { priority: 10 });
ResourceLoader.include(['non-critical.js'], { priority: 1 });
```

### State Tracking and Deduplication

ResourceLoader.js keeps an internal registry of every URL it has seen. Requesting a resource that is already loaded or currently loading returns the existing Promise rather than starting a duplicate request. You can query state at any time:

```js
ResourceLoader.getResourceState('app.js');
// → 'loading' | 'loaded' | 'unloaded'
```

### Cache Busting

Optionally append a timestamp query string to prevent browsers from serving stale cached assets:

```js
ResourceLoader.include([url], {
  cacheBusting: true,
  cacheBustingTypes: ['js', 'css'],
  restrictCacheBustingToLocal: true, // Only bust same-origin URLs (default)
});
```

### Structured Error Types

Every failure produces a categorized error object with a `type` field:

| Type          | Meaning                                             |
|---------------|-----------------------------------------------------|
| `network`     | HTTP failure, DNS failure, or connectivity issue    |
| `timeout`     | Load exceeded the configured timeout duration       |
| `abort`       | Load was cancelled via `cancelResource()`           |
| `unsupported` | File extension is not recognized                    |

### Per-Resource Callbacks

React to individual successes or failures alongside the top-level Promise:

```js
ResourceLoader.include(urls, {
  onSuccess: (data, url) => console.log('Loaded:', url),
  onError: (error, url) => console.error('Failed:', url, error.type),
});
```

### Resource Cancellation

Cancel an in-flight load or unload an already-loaded resource:

```js
ResourceLoader.cancelResource('app.js');   // Abort a loading resource
ResourceLoader.cancelAll();                // Cancel all pending loads
ResourceLoader.unloadResource('app.js');   // Remove a loaded resource from the DOM
```

---

## Installation

### CDN (Recommended for quick use)

Pinned to a specific version (safest for production):

```html
<script src="https://cdn.jsdelivr.net/npm/resourceloader-js@1.0.2/resourceLoader.js"></script>
```

Always latest published version:

```html
<script src="https://cdn.jsdelivr.net/npm/resourceloader-js/resourceLoader.js"></script>
```

### npm

```bash
npm install resourceloader-js
```

```js
const ResourceLoader = require('resourceloader-js');
// or
import ResourceLoader from 'resourceloader-js';
```

### Direct Download

Download `resourceLoader.js` from the repository root and host it yourself. No build step needed.

After inclusion, the library is available as `window.ResourceLoader` (or just `ResourceLoader`) in browser environments.

---

## Quick Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/resourceloader-js/resourceLoader.js"></script>
</head>
<body>
  <script>
    ResourceLoader.include([
      'https://cdn.example.com/theme.css',
      'https://cdn.example.com/vendor.js',
      'https://api.example.com/config.json',
    ], {
      retries: 2,
      timeout: 8000,
      logLevel: 'verbose',
      onSuccess: (data, url) => console.log('Ready:', url),
      onError: (err, url) => console.warn('Failed:', url, err.message),
    })
    .then(() => {
      // All resources ready — initialize the application
      initApp();
    })
    .catch((err) => {
      console.error('One or more resources failed to load:', err);
    });
  </script>
</body>
</html>
```

---

## API Summary

| Method | Description |
|--------|-------------|
| `ResourceLoader.include(urls, options?)` | Load one or more resources. Returns a Promise. |
| `ResourceLoader.getResourceState(url)` | Returns `'loading'`, `'loaded'`, or `'unloaded'`. |
| `ResourceLoader.cancelResource(url)` | Abort a loading resource. |
| `ResourceLoader.cancelAll()` | Abort all pending loads. |
| `ResourceLoader.unloadResource(url)` | Remove a loaded resource from the DOM and state registry. |
| `ResourceLoader.setLoggingLevel(level)` | Set global log verbosity: `'silent'`, `'warn'`, `'verbose'`. |

Full option and API documentation is in the [`docs/`](docs/) folder and hosted at the project site.

---

## Technical Details

- **No dependencies.** Vanilla JavaScript, ES5-compatible syntax (compiled from modern JS).
- **Size.** ~17 KB unminified, single file.
- **Module support.** Works as a CommonJS module (`require()`), ES module (`import`), or as a browser global (`window.ResourceLoader`).
- **License.** MIT. Use freely in personal and commercial projects.
- **Tests.** Vitest + jsdom. Run with `npm test` from the repository root.
- **Node.js.** Not designed for server-side use. The library targets browser APIs (`document`, `FontFace`, `fetch`, DOM elements). Node.js compatibility is limited to environments that polyfill these APIs (e.g., jsdom for testing).

---

## Repository Structure

```
ResourceLoader.js/
├── resourceLoader.js       # The library (single file, ship this)
├── package.json
├── README.md
├── OVERVIEW.md             # This document
├── tests/
│   └── resourceLoader.test.js
├── scripts/
│   └── release.js          # Release automation
└── docs/                   # Astro-based documentation site
    └── src/content/docs/
        ├── getting-started/
        ├── guides/
        ├── api/
        └── reference/
```

---

## Links

- **GitHub:** https://github.com/peterbenoit/ResourceLoader.js
- **npm:** https://www.npmjs.com/package/resourceloader-js
- **jsDelivr CDN:** https://cdn.jsdelivr.net/npm/resourceloader-js/resourceLoader.js
- **unpkg CDN:** https://unpkg.com/resourceloader-js/resourceLoader.js
- **Live demos:** https://codepen.io/peterbenoit/pen/gOVLWXZ
