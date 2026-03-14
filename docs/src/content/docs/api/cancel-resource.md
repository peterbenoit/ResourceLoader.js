---
title: cancelResource()
description: Cancel an in-flight resource load by URL.
---

`cancelResource()` aborts a resource that is currently loading. It is the per-resource counterpart to [`cancelAll()`](/api/cancel-all/).

## Signature

```ts
ResourceLoader.cancelResource(url: string): void
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | The URL of the resource to cancel |

## Behavior

Calling `cancelResource(url)`:

1. Calls `AbortController.abort()` to cancel the underlying `fetch()` request (for JSON and blob types)
2. Removes the DOM element (`<script>`, `<link>`, or `<img>`) if one was created
3. Sets the resource state to `'unloaded'`

The `include()` Promise for the cancelled resource rejects with `{ type: 'abort', message: '...' }`, which bubbles up to an aggregate rejection on the overall `include()` Promise.

### `cancelResource()` vs `unloadResource()`

| | `cancelResource()` | `unloadResource()` |
|--|--|--|
| Purpose | Abort an **in-flight** load | Remove a **completed** load |
| When to use | Resource is still loading | Resource has finished loading |
| Effect on Promise | Causes rejection with `type: 'abort'` | No Promise effect (load is already done) |

---

## Examples

### Cancel a Slow Request

```js
// Start loading a large file
ResourceLoader.include(['https://cdn.example.com/large-library.js'], {
  onError: (error, url) => {
    if (error.type === 'abort') {
      console.log(`Load of ${url} was cancelled`);
    }
  },
}).catch(() => {/* handled via onError */});

// Cancel it 2 seconds later (e.g., user navigated away)
setTimeout(() => {
  ResourceLoader.cancelResource('https://cdn.example.com/large-library.js');
}, 2000);
```

### Cancel on User Action

```js
let isLoading = false;
const cancelUrl = 'https://api.example.com/heavy-data.json';

document.getElementById('load-btn').addEventListener('click', () => {
  if (isLoading) return;
  isLoading = true;

  ResourceLoader.include([cancelUrl], {
    onSuccess: (data) => {
      isLoading = false;
      renderData(data);
    },
    onError: (error) => {
      isLoading = false;
      if (error.type !== 'abort') {
        showError(error.message);
      }
    },
  }).catch(() => {});
});

document.getElementById('cancel-btn').addEventListener('click', () => {
  if (isLoading) {
    ResourceLoader.cancelResource(cancelUrl);
  }
});
```

---

## Notes

- Calling `cancelResource()` on a URL that is not currently loading is a no-op.
- Calling `cancelResource()` on a URL that has already finished loading will not undo the load. Use [`unloadResource()`](/api/unload-resource/) for that.
- For `<script>` and `<link>` elements, the element is removed from the DOM immediately on cancel.
