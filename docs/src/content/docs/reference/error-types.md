---
title: Error Types
description: Complete reference for all error types produced by ResourceLoader.js.
---

ResourceLoader.js categorises every load failure into one of four error types, making it easy to respond appropriately to different failure modes.

## Error Object Shape

Both the `onError` callback and individual `reason` entries in the aggregate error use the same shape:

```ts
{
  type: 'network' | 'timeout' | 'abort' | 'unsupported';
  message: string;
}
```

## Error Types

### `network`

**When it occurs:** The resource could not be fetched due to a network-level failure — HTTP 404, HTTP 500, no internet connection, DNS failure, or any other fetch error.

**Retried?** Yes (if `retries > 0`)

**Example:**

```js
ResourceLoader.include(['https://example.com/missing.js'], {
  onError: (error) => {
    // error.type === 'network'
    // error.message === 'Network error while loading resource: ...'
    showError('Resource not found or network is unavailable.');
  },
});
```

**When to retry:** `network` errors are good candidates for retries because they may be transient (temporary server hiccup, brief connectivity loss).

---

### `timeout`

**When it occurs:** The resource did not finish loading within the [`timeout`](/reference/options/#timeout) period (default: 10,000ms). The load is aborted automatically.

**Retried?** Yes (if `retries > 0`), each retry gets a fresh timeout clock.

**Example:**

```js
ResourceLoader.include(['https://slow-server.example.com/data.json'], {
  timeout: 3000,
  onError: (error) => {
    // error.type === 'timeout'
    // error.message === 'Resource load timed out: ...'
    showError('The request is taking too long. Please try again.');
  },
});
```

**When to retry:** Useful for transient slowness. Consider increasing `timeout` instead if the server is consistently slow.

---

### `abort`

**When it occurs:** The load was explicitly cancelled by calling [`cancelResource(url)`](/api/cancel-resource/) or [`cancelAll()`](/api/cancel-all/).

**Retried?** No — an abort is intentional.

**Example:**

```js
ResourceLoader.include(['https://api.example.com/data.json'], {
  onError: (error) => {
    if (error.type === 'abort') {
      // User or code cancelled the load — this is expected
      console.log('Load cancelled.');
    }
  },
}).catch(() => {});

// Cancel it
ResourceLoader.cancelResource('https://api.example.com/data.json');
```

---

### `unsupported`

**When it occurs:** The file extension is not in ResourceLoader.js's list of supported types, and no inference pattern matched the URL.

**Retried?** No — the error is deterministic; retrying will always produce the same result.

**Example:**

```js
ResourceLoader.include(['https://example.com/data.xml'], {
  onError: (error) => {
    // error.type === 'unsupported'
    // error.message === 'Unsupported resource type: xml'
    console.error('XML is not a supported resource type.');
  },
});
```

See [Supported File Types](/reference/supported-types/) for the full list of supported extensions.

---

## Summary Table

| Type | Cause | Retried? | Recovery |
|------|-------|----------|----------|
| `network` | HTTP error, no connection | Yes | Retry, show connectivity warning |
| `timeout` | Slow server or connection | Yes | Retry, increase timeout |
| `abort` | Explicit cancellation | No | Expected — no recovery needed |
| `unsupported` | Unknown file extension | No | Fix the URL extension |

---

## The Aggregate Error

When the `include()` Promise rejects, it provides an **aggregate error** wrapping all individual failures:

```ts
{
  type: 'aggregate';
  message: 'One or more resources failed to load.';
  results: Array<
    | { status: 'fulfilled'; value: string | object | Blob | undefined }
    | { status: 'rejected'; reason: { type: string; message: string }; url: string }
  >;
}
```

### Full Example

```js
ResourceLoader.include([
  'https://cdn.example.com/a.css',   // succeeds
  'https://cdn.example.com/b.js',    // 404 — fails
  'https://cdn.example.com/c.json',  // succeeds
]).catch((error) => {
  if (error.type !== 'aggregate') throw error;

  console.log(error.results);
  // [
  //   { status: 'fulfilled', value: 'https://cdn.example.com/a.css' },
  //   {
  //     status: 'rejected',
  //     reason: { type: 'network', message: 'Network error while loading...' },
  //     url: 'https://cdn.example.com/b.js'
  //   },
  //   { status: 'fulfilled', value: { /* parsed JSON */ } },
  // ]

  const failures = error.results.filter(r => r.status === 'rejected');
  failures.forEach(({ reason, url }) => {
    console.error(`  ${url}: [${reason.type}] ${reason.message}`);
  });
});
```
