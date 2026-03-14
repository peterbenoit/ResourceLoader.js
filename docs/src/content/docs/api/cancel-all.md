---
title: cancelAll()
description: Cancel all in-flight resource loads at once.
---

`cancelAll()` aborts every resource that is currently loading and clears the internal load queue.

## Signature

```ts
ResourceLoader.cancelAll(): void
```

## Parameters

None.

## Behavior

Calling `cancelAll()`:

1. Iterates all currently tracked in-flight loads
2. Calls `AbortController.abort()` for each fetch-based resource
3. Removes DOM elements for element-based resources
4. Clears the internal promises map entirely
5. Sets all in-flight resources to `'unloaded'`

---

## Examples

### Cancel All on Page Navigation

Cancelling in-flight loads when the user navigates away prevents unnecessary network traffic and avoids errors from trying to update a page that no longer exists:

```js
window.addEventListener('beforeunload', () => {
  ResourceLoader.cancelAll();
});
```

### "Stop Loading" Button

```js
let isLoading = false;

async function startLoading() {
  isLoading = true;
  document.getElementById('stop-btn').disabled = false;

  try {
    await ResourceLoader.include([
      'https://cdn.example.com/a.js',
      'https://cdn.example.com/b.js',
      'https://cdn.example.com/c.js',
    ]);
    isLoading = false;
    document.getElementById('stop-btn').disabled = true;
    initApp();
  } catch (error) {
    isLoading = false;
    document.getElementById('stop-btn').disabled = true;
    if (error.type !== 'aggregate') throw error;
    const wasAborted = error.results.every(r =>
      r.status === 'rejected' && r.reason?.type === 'abort'
    );
    if (!wasAborted) showError('Some resources failed to load.');
  }
}

document.getElementById('stop-btn').addEventListener('click', () => {
  if (isLoading) ResourceLoader.cancelAll();
});
```

### Single Page App Route Change

When using a client-side router, cancel any pending loads from the previous route before starting new ones:

```js
router.beforeEach((to, from, next) => {
  // Cancel all loads from the previous route
  ResourceLoader.cancelAll();
  next();
});
```

---

## Notes

- `cancelAll()` only affects resources that are currently **loading**. Already-completed loads are unaffected.
- After `cancelAll()`, the internal state map is cleared. `getResourceState(url)` will return `'unloaded'` for all URLs.
- Resources cancelled this way can be loaded again with a new `include()` call.
