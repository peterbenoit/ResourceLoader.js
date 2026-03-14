---
title: include()
description: Load one or more resources asynchronously. The primary method of ResourceLoader.js.
---

`include()` is the main method of ResourceLoader.js. It loads one or more resources and returns a Promise that resolves when all resources have loaded.

## Signature

```ts
ResourceLoader.include(
  urls: string | string[],
  options?: IncludeOptions
): Promise<Result[]>
```

## Parameters

### `urls`

**Type:** `string | string[]`

A single URL string or an array of URL strings to load. A single string is automatically wrapped in an array.

```js
// Single URL
ResourceLoader.include('https://cdn.example.com/app.js');

// Array of URLs
ResourceLoader.include([
  'https://cdn.example.com/app.css',
  'https://cdn.example.com/app.js',
]);
```

### `options`

**Type:** `object` (optional)

Configuration for this load operation. All properties are optional. See the [Options Reference](/reference/options/) for the full list.

**Most commonly used options:**

| Option | Default | Description |
|--------|---------|-------------|
| `timeout` | `10000` | Milliseconds before a load is aborted |
| `retries` | `0` | Number of retry attempts on failure |
| `retryDelay` | `1000` | Milliseconds between retries |
| `maxConcurrency` | `3` | Max simultaneous loads |
| `onSuccess` | — | Per-resource success callback |
| `onError` | — | Per-resource error callback |
| `logLevel` | `'warn'` | Logging verbosity |

## Return Value

Returns a `Promise` that:

- **Resolves** with an array of result objects when all resources load successfully:
  ```js
  [
    { status: 'fulfilled', value: 'https://cdn.example.com/app.css' },
    { status: 'fulfilled', value: 'https://cdn.example.com/app.js' },
  ]
  ```
  - For **JS, CSS, and image** types: `value` is the URL string
  - For **JSON** types: `value` is the parsed JavaScript object
  - For **blob** types (audio, video, PDF, zip, bin): `value` is a `Blob` object
  - For **font** types: `value` is `undefined`

- **Rejects** with an aggregate error object if any resource fails:
  ```js
  {
    type: 'aggregate',
    message: 'One or more resources failed to load.',
    results: [
      { status: 'fulfilled', value: '...' },
      { status: 'rejected', reason: { type: 'network', message: '...' }, url: '...' }
    ]
  }
  ```

---

## Examples

### Basic: Load a Script

```js
ResourceLoader.include(['https://cdn.example.com/library.js'])
  .then(() => {
    // Library is now in the DOM and ready to use
    initLibrary();
  })
  .catch((error) => {
    console.error('Failed to load library:', error);
  });
```

### Using async/await

```js
async function loadDependencies() {
  try {
    await ResourceLoader.include([
      'https://cdn.example.com/styles.css',
      'https://cdn.example.com/app.js',
    ]);
    startApp();
  } catch (error) {
    showLoadError();
  }
}
```

### Using Callbacks

```js
ResourceLoader.include(['https://api.example.com/config.json'], {
  onSuccess: (data) => {
    // data is the parsed JSON object
    applyConfig(data);
  },
  onError: (error, url) => {
    console.error(`[${error.type}] Failed: ${url}`);
  },
});
```

### Inspecting Results

```js
const results = await ResourceLoader.include([
  'https://cdn.example.com/a.css',
  'https://api.example.com/b.json',
  'https://cdn.example.com/c.js',
]);

results.forEach((result) => {
  if (result.status === 'fulfilled') {
    if (typeof result.value === 'string') {
      console.log('Loaded URL:', result.value);
    } else {
      console.log('Loaded data:', result.value);
    }
  }
});
```

### Mixed Types with Per-Resource Handling

```js
await ResourceLoader.include([
  'https://cdn.example.com/app.css',
  'https://cdn.example.com/app.js',
  'https://api.example.com/config.json',
  'https://cdn.example.com/logo.png',
], {
  retries: 2,
  timeout: 8000,
  maxConcurrency: 4,
  onSuccess: (data) => {
    // Fires once per resource as each loads
    if (data instanceof Blob) {
      console.log('Blob loaded');
    } else if (typeof data === 'object') {
      console.log('JSON loaded:', Object.keys(data));
    } else {
      console.log('Resource loaded:', data);
    }
  },
  onError: (error, url) => {
    console.warn(`${url} failed: ${error.type}`);
  },
});
```

### Handling Partial Failures

```js
ResourceLoader.include([
  'https://cdn.example.com/critical.js',
  'https://cdn.example.com/optional.js', // Might fail
]).catch((error) => {
  if (error.type !== 'aggregate') throw error;

  const critical = error.results.find(
    r => r.url === 'https://cdn.example.com/critical.js'
  );

  if (critical?.status === 'rejected') {
    showFatalError('Critical resource failed to load.');
  } else {
    // Critical loaded — proceed without optional
    console.warn('Optional resource failed, continuing...');
    startApp();
  }
});
```

---

## Notes

- **Deduplication**: If a `<script src>` or `<link href>` element with the same URL already exists in the DOM, that resource is not loaded again. The Promise still resolves normally.
- **State tracking**: After `include()` resolves, `getResourceState(url)` returns `'loaded'` for each URL.
- **Single string**: Passing a string (not array) is equivalent to passing `[string]`. The result is always an array.
