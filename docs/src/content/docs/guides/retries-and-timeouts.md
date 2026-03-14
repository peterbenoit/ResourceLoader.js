---
title: Retries & Timeouts
description: Make your resource loading resilient against flaky networks and slow servers with automatic retries and configurable timeouts.
---

ResourceLoader.js has built-in support for retrying failed loads and aborting slow ones. These features work together to make resource loading resilient without any extra code on your part.

## Timeout

Every resource load has a timeout. If the resource does not finish loading within the timeout period, the load is aborted and treated as a failure.

**Default timeout: 10,000 ms (10 seconds)**

### Setting a Custom Timeout

```js
ResourceLoader.include(['https://api.example.com/data.json'], {
  timeout: 5000, // 5 seconds
});
```

### Timeout Applies Per Resource

When loading multiple resources, each one gets its own independent timeout clock. One slow resource does not affect the timeout for the others.

```js
ResourceLoader.include([
  'https://cdn.example.com/fast.css', // Has its own 5-second clock
  'https://slow-api.example.com/data.json', // Has its own 5-second clock
], {
  timeout: 5000,
});
```

### Timeout Error

When a timeout occurs, the resource fails with `error.type === 'timeout'`:

```js
ResourceLoader.include(['https://slow-server.example.com/large.js'], {
  timeout: 3000,
  onError: (error, url) => {
    if (error.type === 'timeout') {
      console.warn(`${url} took too long — load aborted after 3s`);
    }
  },
});
```

---

## Retries

By default, failed loads are **not retried** (`retries: 0`). Set `retries` to a positive integer to automatically retry on failure.

### Basic Retry

```js
ResourceLoader.include(['https://flaky-api.example.com/config.json'], {
  retries: 3, // Try up to 4 times total (1 initial + 3 retries)
});
```

### Retry Delay

Use `retryDelay` (in milliseconds) to add a pause between retry attempts. This prevents hammering a server that is temporarily overloaded:

```js
ResourceLoader.include(['https://flaky-api.example.com/config.json'], {
  retries: 3,
  retryDelay: 2000, // Wait 2 seconds between attempts
});
```

### Retry Lifecycle

Each retry attempt is independent. If attempt 1 fails, `retryDelay` is waited, then attempt 2 starts. Here is the flow:

```
Attempt 1 → FAIL
  └─ wait 2000ms
Attempt 2 → FAIL
  └─ wait 2000ms
Attempt 3 → FAIL
  └─ wait 2000ms
Attempt 4 → FAIL → reject with error
```

```
Attempt 1 → FAIL
  └─ wait 2000ms
Attempt 2 → SUCCESS → resolve
```

:::note[Retries and timeout]
Each retry attempt gets a **fresh timeout clock**. If `timeout: 5000` and `retries: 2`, a load that times out on attempt 1 will retry twice, each with a fresh 5-second window — for a worst-case total of 15 seconds of network time (plus 2 × `retryDelay`).
:::

### Full Example with Retry and Timeout

```js
ResourceLoader.include(['https://flaky-api.example.com/data.json'], {
  timeout: 8000,
  retries: 3,
  retryDelay: 1500,
  onSuccess: (data) => {
    console.log('Loaded successfully:', data);
  },
  onError: (error, url) => {
    // This fires after ALL retries are exhausted
    console.error(`All attempts failed for ${url}:`, error.type);
  },
}).catch((error) => {
  // Promise rejects after all retries fail
  showErrorUI('Could not load required data. Please refresh.');
});
```

---

## What Gets Retried

| Error Type | Retried? | Reason |
|------------|----------|--------|
| `network` | Yes | Could be a transient network hiccup |
| `timeout` | Yes | Server may have been temporarily slow |
| `abort` | No | User or code explicitly cancelled the load |
| `unsupported` | No | The file type will never be supported — retrying is pointless |

---

## When NOT to Use Retries

- **Unsupported file types**: The error is deterministic — retries waste time.
- **Authentication errors (HTTP 401/403)**: Retrying won't fix an auth failure — handle it explicitly.
- **Very large files**: Retrying a 50 MB download three times can be costly on mobile. Consider increasing `timeout` instead.
- **User-initiated cancellations**: If the user clicks "Cancel", don't retry — they made an intentional choice.

---

## Recommended Settings by Scenario

| Scenario | `timeout` | `retries` | `retryDelay` |
|----------|-----------|-----------|--------------|
| CDN static assets (fast) | 10000 | 0 | — |
| CDN static assets (production) | 10000 | 1 | 1000 |
| REST API (stable) | 8000 | 1 | 1000 |
| REST API (flaky/external) | 8000 | 3 | 2000 |
| Large binary file | 30000 | 1 | 3000 |
| Real-time data (must be fresh) | 3000 | 0 | — |
