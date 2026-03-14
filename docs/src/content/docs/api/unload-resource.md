---
title: unloadResource()
description: Remove a loaded resource from the page and reset its state.
---

`unloadResource()` removes a previously loaded resource from the DOM and clears its internal state, allowing it to be loaded again with `include()`.

## Signature

```ts
ResourceLoader.unloadResource(url: string): void
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | The URL of the resource to unload |

## Behavior

Calling `unloadResource(url)`:

1. Removes all `<script src="url">` and `<link href="url">` elements from the DOM (both `<head>` and `<body>`)
2. Deletes the cached Promise for that URL
3. Sets the resource state to `'unloaded'`

For JSON and blob resources (which are not DOM elements), it clears the internal state but does not revoke any object URLs — that is the caller's responsibility.

---

## Examples

### Basic Unload

```js
// Load a stylesheet
await ResourceLoader.include(['https://cdn.example.com/theme.css']);
console.log(ResourceLoader.getResourceState('https://cdn.example.com/theme.css'));
// → 'loaded'

// Unload it
ResourceLoader.unloadResource('https://cdn.example.com/theme.css');
console.log(ResourceLoader.getResourceState('https://cdn.example.com/theme.css'));
// → 'unloaded'
```

### Hot-Swapping a Stylesheet

A common use case is swapping between themes:

```js
let currentTheme = null;

async function switchTheme(themeName) {
  // Unload the current theme
  if (currentTheme) {
    ResourceLoader.unloadResource(currentTheme);
  }

  // Load the new theme
  const newThemeUrl = `https://cdn.example.com/themes/${themeName}.css`;
  await ResourceLoader.include([newThemeUrl]);
  currentTheme = newThemeUrl;
  console.log(`Switched to theme: ${themeName}`);
}

// Usage
await switchTheme('dark');
await switchTheme('light');
```

### Plugin System

```js
const loadedPlugins = new Map();

async function loadPlugin(name, url) {
  if (loadedPlugins.has(name)) {
    console.log(`Plugin ${name} already loaded.`);
    return;
  }
  await ResourceLoader.include([url]);
  loadedPlugins.set(name, url);
}

function unloadPlugin(name) {
  const url = loadedPlugins.get(name);
  if (url) {
    ResourceLoader.unloadResource(url);
    loadedPlugins.delete(name);
    console.log(`Plugin ${name} unloaded.`);
  }
}

// Usage
await loadPlugin('charts', 'https://cdn.example.com/charts.js');
unloadPlugin('charts');
```

---

## Notes

- Calling `unloadResource()` on a URL that was never loaded (or was already unloaded) is a no-op.
- After calling `unloadResource()`, a subsequent `include()` with the same URL will load the resource fresh from the network.
- For blob resources, object URLs created by `URL.createObjectURL()` are **not** revoked automatically. Call `URL.revokeObjectURL(objectUrl)` manually to free memory.
