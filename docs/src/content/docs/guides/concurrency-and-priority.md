---
title: Concurrency & Priority
description: Control how many resources load simultaneously and prioritize critical assets over non-critical ones.
---

When loading many resources at once, ResourceLoader.js uses a concurrency queue to prevent overloading the browser and your server. You can also assign priority levels to ensure critical resources load before non-critical ones.

## Concurrency Control

### `maxConcurrency`

The `maxConcurrency` option limits how many resources load simultaneously. The default is `3`.

```js
// Load a large batch — at most 5 at a time
ResourceLoader.include([
  'https://cdn.example.com/a.js',
  'https://cdn.example.com/b.js',
  'https://cdn.example.com/c.js',
  'https://cdn.example.com/d.js',
  'https://cdn.example.com/e.js',
  'https://cdn.example.com/f.js',
], {
  maxConcurrency: 5,
});
```

As each resource finishes, the next one in the queue starts. With 6 URLs and `maxConcurrency: 5`, the first 5 begin immediately, and the 6th starts as soon as any one of the first 5 completes.

### Why Limit Concurrency?

- **Browser connection limits**: Browsers limit simultaneous connections to a single domain (typically 6). Exceeding this causes requests to queue in the browser anyway — setting `maxConcurrency` slightly below that limit is more predictable.
- **Server rate limiting**: Loading 50 resources simultaneously might trigger rate limiting on your CDN or API.
- **Performance**: Too many simultaneous loads can delay your page's critical rendering path. Keeping concurrency low for non-critical resources prevents them from competing with important assets.

### Choosing a `maxConcurrency` Value

| Scenario | Recommended `maxConcurrency` |
|----------|------------------------------|
| CDN static assets | 4–6 |
| REST API calls | 2–4 |
| Large files (video, zip) | 1–2 |
| Development / testing | No limit needed — use default |

---

## Priority

### How Priority Works

The `priority` option is a number (default `0`). Higher values load first. Priority takes effect across **separate `include()` calls** — within a single call, all URLs share the same priority.

```js
// Critical resources — load first (higher priority)
ResourceLoader.include([
  'https://cdn.example.com/app.css',
  'https://cdn.example.com/app.js',
], {
  priority: 10,
});

// Non-critical analytics — load after critical resources
ResourceLoader.include([
  'https://analytics.example.com/tracker.js',
], {
  priority: 0, // lower priority
});
```

The library sorts URLs by priority before starting the concurrency queue, so `priority: 10` URLs will always start loading before `priority: 0` URLs (subject to `maxConcurrency`).

### Priority Values

There are no predefined levels — any numbers work. Use whatever scale makes sense for your project:

```js
// Example priority scale
const PRIORITY = {
  CRITICAL: 100,
  HIGH:      50,
  NORMAL:    10,
  LOW:        1,
  ANALYTICS:  0,
};

ResourceLoader.include(['https://cdn.example.com/fonts.css'], { priority: PRIORITY.CRITICAL });
ResourceLoader.include(['https://cdn.example.com/app.js'],   { priority: PRIORITY.HIGH });
ResourceLoader.include(['https://cdn.example.com/charts.js'],{ priority: PRIORITY.LOW });
ResourceLoader.include(['https://track.example.com/a.js'],   { priority: PRIORITY.ANALYTICS });
```

---

## Cancelling All Queued Loads

Use `cancelAll()` to abort every in-flight load and clear the queue:

```js
// Start loading many resources
ResourceLoader.include([...largeListOfUrls], { maxConcurrency: 3 });

// User navigates away — cancel everything
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    ResourceLoader.cancelAll();
  }
});
```

See [`cancelAll()`](/api/cancel-all/) for full details.

---

## Full Example: Staged Loading

A common pattern is to load critical resources first, then non-critical ones after the app initializes:

```js
async function loadApp() {
  // Stage 1: Critical path — wait for these before starting the app
  await ResourceLoader.include([
    'https://cdn.example.com/styles.css',
    'https://cdn.example.com/app.js',
    'https://api.example.com/config.json',
  ], {
    priority: 100,
    maxConcurrency: 3,
    retries: 2,
  });

  // App is ready — start it
  initApp();

  // Stage 2: Enhancements — load in the background after the app starts
  ResourceLoader.include([
    'https://cdn.example.com/charts.js',
    'https://cdn.example.com/animations.js',
    'https://analytics.example.com/tracker.js',
  ], {
    priority: 0,
    maxConcurrency: 2,
  });
}

loadApp();
```
