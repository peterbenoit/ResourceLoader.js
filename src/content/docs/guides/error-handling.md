---
title: Error Handling
description: Understand all error types, catch failures gracefully, and build resilient resource loading.
---

ResourceLoader.js has two separate places where errors surface: the **`onError` callback** (per-resource, fires immediately) and the **Promise rejection** (fires after the entire batch finishes). You can use both together.

## The Two Error Surfaces

### `onError` Callback

Fires immediately when a specific resource fails, before the overall Promise settles. Use this to show inline error UI or log individual failures:

```js
ResourceLoader.include(['https://cdn.example.com/app.js'], {
  onError: (error, url) => {
    // error.type: 'network' | 'timeout' | 'abort' | 'unsupported'
    // error.message: human-readable description
    // url: the URL that failed
    console.warn(`Failed to load ${url}: [${error.type}] ${error.message}`);
  },
});
```

### Promise Rejection

When any resource in the batch fails, the Promise rejects with an **aggregate error** after all resources have either succeeded or failed. This lets you handle the overall result in one place:

```js
ResourceLoader.include([
  'https://cdn.example.com/app.css',
  'https://cdn.example.com/bad-script.js', // This will fail
]).catch((aggregateError) => {
  console.log(aggregateError.type);    // 'aggregate'
  console.log(aggregateError.message); // 'One or more resources failed to load.'
  console.log(aggregateError.results);
  // [
  //   { status: 'fulfilled', value: 'https://cdn.example.com/app.css' },
  //   { status: 'rejected', reason: { type: 'network', message: '...' }, url: 'https://cdn.example.com/bad-script.js' }
  // ]
});
```

---

## The Error Object

Both the `onError` callback and individual `reason` entries in the aggregate use the same error shape:

```js
{
  type: 'network' | 'timeout' | 'abort' | 'unsupported',
  message: string
}
```

## The Aggregate Error Object

```js
{
  type: 'aggregate',
  message: 'One or more resources failed to load.',
  results: [
    // One entry per URL, in the same order as the input array
    { status: 'fulfilled', value: 'https://...' },
    { status: 'rejected', reason: { type: 'network', message: '...' }, url: 'https://...' }
  ]
}
```

---

## Error Types Reference

| Type | When it occurs | Retried? |
|------|----------------|----------|
| `network` | HTTP error (404, 500), resource not found, or no connection | Yes |
| `timeout` | Load time exceeded the `timeout` option | Yes |
| `abort` | `cancelResource()` or `cancelAll()` was called | No |
| `unsupported` | File extension is not in the supported list | No |

:::tip
Set `retries` to automatically retry `network` and `timeout` errors. See [Retries & Timeouts](/guides/retries-and-timeouts/).
:::

---

## Handling Specific Error Types

```js
ResourceLoader.include(['https://api.example.com/data.json'], {
  timeout: 5000,
  onError: (error, url) => {
    switch (error.type) {
      case 'network':
        showBanner('Could not load data. Check your internet connection.');
        break;
      case 'timeout':
        showBanner('Request timed out. Please try again later.');
        break;
      case 'abort':
        console.log('Load was cancelled by the application.');
        break;
      case 'unsupported':
        console.error(`Unsupported file type for URL: ${url}`);
        break;
    }
  },
});
```

---

## Inspecting the Aggregate Error

When you need to know which resources succeeded and which failed:

```js
ResourceLoader.include([
  'https://cdn.example.com/a.css',
  'https://cdn.example.com/b.css',
  'https://example.com/c.css', // 404
]).catch((error) => {
  if (error.type !== 'aggregate') throw error; // unexpected error — rethrow

  const succeeded = error.results.filter(r => r.status === 'fulfilled');
  const failed    = error.results.filter(r => r.status === 'rejected');

  console.log(`${succeeded.length} succeeded, ${failed.length} failed`);

  failed.forEach(({ reason, url }) => {
    console.error(`  ${url} — ${reason.type}: ${reason.message}`);
  });
});
```

---

## Unsupported File Types

If you pass a URL with an extension that ResourceLoader.js doesn't recognize, the load fails immediately with `type: 'unsupported'`:

```js
ResourceLoader.include(['https://example.com/data.xml'], {
  onError: (error, url) => {
    console.error(error.type);    // 'unsupported'
    console.error(error.message); // 'Unsupported resource type: xml'
  },
}).catch(() => {}); // Promise also rejects
```

See [Supported File Types](/reference/supported-types/) for the full list of supported extensions.

---

## `removeFailedElements`

When a `<script>` or `<link>` load fails, the element is automatically removed from the DOM (default: `removeFailedElements: true`). This prevents broken element stubs from cluttering the page.

Set to `false` only for debugging purposes:

```js
ResourceLoader.include(['https://example.com/missing.js'], {
  removeFailedElements: false, // Keep the <script> element for inspection
});
```

---

## Complete Error Handling Pattern

Here is a production-ready pattern that handles all cases:

```js
async function loadAppResources() {
  try {
    const results = await ResourceLoader.include([
      'https://cdn.example.com/app.css',
      'https://api.example.com/config.json',
      'https://cdn.example.com/app.js',
    ], {
      retries: 2,
      timeout: 10000,
      onError: (error, url) => {
        // Log each failure as it happens — useful for monitoring
        analytics.track('resource_load_error', {
          url,
          errorType: error.type,
          message: error.message,
        });
      },
    });

    // All resources loaded successfully
    const config = results.find(r => typeof r.value === 'object')?.value ?? {};
    startApp(config);

  } catch (error) {
    if (error.type === 'aggregate') {
      const criticalFailed = error.results.some(
        r => r.status === 'rejected' && r.url.endsWith('app.js')
      );

      if (criticalFailed) {
        showFatalError('The application could not load. Please refresh the page.');
      } else {
        console.warn('Some non-critical resources failed. Continuing with degraded mode.');
        startApp({});
      }
    } else {
      throw error; // Unexpected error type — let it propagate
    }
  }
}
```
