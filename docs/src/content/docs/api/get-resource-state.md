---
title: getResourceState()
description: Query the current loading state of any resource URL.
---

`getResourceState()` returns the current state of a resource — whether it is loading, has loaded, or is not loaded.

## Signature

```ts
ResourceLoader.getResourceState(url: string): 'loading' | 'loaded' | 'unloaded'
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | The URL to query |

## Return Value

One of three string literals:

| State | Meaning |
|-------|---------|
| `'loading'` | `include()` has been called for this URL and it has not yet finished |
| `'loaded'` | The resource has finished loading successfully |
| `'unloaded'` | The resource has never been loaded, was cancelled, errored out, or was explicitly unloaded |

:::note
`getResourceState()` returns `'unloaded'` for URLs that the library has **never seen**. It never returns `undefined`.
:::

---

## State Transitions

```
[never seen / initial]
        │
        ▼
   'unloaded'  ◄────── cancelResource() / unloadResource() / error
        │
   include() called
        │
        ▼
   'loading'
        │
   load complete
        │
        ▼
    'loaded'
```

---

## Examples

### Check State After Loading

```js
const url = 'https://cdn.example.com/app.js';

console.log(ResourceLoader.getResourceState(url)); // 'unloaded'

await ResourceLoader.include([url]);

console.log(ResourceLoader.getResourceState(url)); // 'loaded'
```

### Conditional Load (Avoid Duplicate Loads)

```js
async function ensureLoaded(url) {
  const state = ResourceLoader.getResourceState(url);

  if (state === 'loaded') {
    return; // Already loaded — nothing to do
  }

  if (state === 'loading') {
    // Wait for the in-flight load to complete
    // (call include() again — it returns the same Promise if already in flight)
    await ResourceLoader.include([url]);
    return;
  }

  // State is 'unloaded' — load it now
  await ResourceLoader.include([url]);
}

await ensureLoaded('https://cdn.example.com/charts.js');
renderChart(); // Safe to call — charts.js is definitely loaded
```

### Debug: Log All Known Resource States

```js
const urls = [
  'https://cdn.example.com/app.css',
  'https://cdn.example.com/app.js',
  'https://api.example.com/config.json',
];

urls.forEach(url => {
  console.log(`${url}: ${ResourceLoader.getResourceState(url)}`);
});
```

### Guard Against Premature Usage

```js
function renderWidget() {
  const chartUrl = 'https://cdn.example.com/charts.js';

  if (ResourceLoader.getResourceState(chartUrl) !== 'loaded') {
    console.error('Charts library is not loaded yet. Call loadDependencies() first.');
    return;
  }

  // Safe to use the charts API
  new Chart(/* ... */);
}
```

---

## Notes

- `getResourceState()` is synchronous — it reads from an in-memory map and returns immediately.
- The state reflects what ResourceLoader.js knows about a URL. If a resource was added to the DOM outside of ResourceLoader.js (e.g., a `<script>` tag written directly in HTML), its state is still `'unloaded'` from the library's perspective.
