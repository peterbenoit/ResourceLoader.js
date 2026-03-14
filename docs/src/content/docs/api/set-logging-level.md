---
title: setLoggingLevel()
description: Configure how much ResourceLoader.js logs to the browser console.
---

`setLoggingLevel()` sets the global logging verbosity for ResourceLoader.js. This is useful for silencing the library in production or enabling verbose output during development.

## Signature

```ts
ResourceLoader.setLoggingLevel(level: 'silent' | 'warn' | 'verbose'): void
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | `'silent' \| 'warn' \| 'verbose'` | The logging level to use |

---

## Logging Levels

| Level | Console output |
|-------|----------------|
| `'silent'` | Nothing — no console output at all |
| `'warn'` | Warnings and errors only (`console.warn`) — **this is the default** |
| `'verbose'` | All messages, including successful load confirmations (`console.log`) |

### `'silent'`

No output whatsoever. Use in production to keep the console clean:

```js
ResourceLoader.setLoggingLevel('silent');
```

### `'warn'` (default)

Only important messages such as missing `integrity` attributes, invalid option values, and load failures. You do not need to call this explicitly — it is the default.

```js
ResourceLoader.setLoggingLevel('warn');
```

### `'verbose'`

Everything — useful during development to see exactly what is happening:

```js
ResourceLoader.setLoggingLevel('verbose');
// Console will show:
// [ResourceLoader] Loading: https://cdn.example.com/app.js
// [ResourceLoader] Loaded: https://cdn.example.com/app.js
// etc.
```

---

## Relationship to the `logLevel` Option

The `logLevel` option on `include()` and `setLoggingLevel()` both set the same global logging level. They are equivalent. Whichever is called last takes effect:

```js
// These two are equivalent:
ResourceLoader.setLoggingLevel('verbose');

ResourceLoader.include(['https://cdn.example.com/app.js'], {
  logLevel: 'verbose',
});
```

`setLoggingLevel()` is useful when you want to set the level **once** at startup rather than passing `logLevel` to every `include()` call.

---

## Examples

### Production Setup

```js
// At the top of your app's entry point
if (process.env.NODE_ENV === 'production') {
  ResourceLoader.setLoggingLevel('silent');
} else {
  ResourceLoader.setLoggingLevel('verbose');
}
```

### Temporarily Enable Verbose Logging

```js
async function debugLoad(url) {
  ResourceLoader.setLoggingLevel('verbose');

  try {
    await ResourceLoader.include([url]);
  } finally {
    ResourceLoader.setLoggingLevel('warn'); // Restore default
  }
}
```

---

## Notes

- Passing an invalid level (e.g., `'debug'`) falls back to `'warn'` and logs a console warning about the invalid value.
- The level set by `setLoggingLevel()` persists for the lifetime of the page until changed again.
