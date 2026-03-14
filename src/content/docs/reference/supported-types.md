---
title: Supported File Types
description: Every file type ResourceLoader.js can load, how each is loaded, and what you receive in the success callback.
---

ResourceLoader.js automatically detects resource types from file extensions and uses the appropriate loading mechanism for each.

## All Supported Types

| Category | Extensions | Loading Mechanism | `onSuccess` receives | Promise value |
|----------|-----------|------------------|----------------------|---------------|
| Scripts | `js` | `<script>` element | URL string | URL string |
| Stylesheets | `css` | `<link rel="stylesheet">` element | URL string | URL string |
| Data | `json` | `fetch()` + `response.json()` | Parsed object | Parsed object |
| Images | `jpg`, `jpeg`, `png`, `gif`, `svg`, `webp` | `<img>` element | URL string | URL string |
| Fonts | `woff`, `woff2` | `FontFace` API | `undefined` | `undefined` |
| Audio | `mp3`, `ogg`, `wav` | `fetch()` + `response.blob()` | `Blob` | `Blob` |
| Video | `mp4`, `avi`, `webm` | `fetch()` + `response.blob()` | `Blob` | `Blob` |
| Binary / PDF | `pdf`, `zip`, `bin` | `fetch()` + `response.blob()` | `Blob` | `Blob` |

---

## Loading Mechanisms Explained

### Element-Based Loading (Scripts, CSS, Images)

For `js`, `css`, and image types, ResourceLoader.js creates a DOM element and waits for its `load` event:

- **Scripts**: Creates `<script src="url">` and appends it to `<head>` (or `<body>` with `appendToBody: true`)
- **Stylesheets**: Creates `<link rel="stylesheet" href="url">` and appends it to `<head>`
- **Images**: Creates `<img src="url">` — the image is pre-fetched and cached by the browser but not displayed; you display it using the URL in `onSuccess`

The success callback and Promise value receive the original **URL string**.

### Fetch-Based Loading (JSON, Audio, Video, Binary)

For `json`, audio, video, and binary types, ResourceLoader.js uses the `fetch()` API:

- **JSON**: `fetch(url).then(r => r.json())` — returns the parsed JavaScript object
- **Blob types**: `fetch(url).then(r => r.blob())` — returns a `Blob` object

These loads respect the `timeout` option via `AbortController` and can be cancelled with `cancelResource()`.

### Font Loading (FontFace API)

For `woff` and `woff2` files, ResourceLoader.js uses the `FontFace` constructor:

```js
const font = new FontFace('customFont', `url(${url})`);
await font.load();
document.fonts.add(font);
```

The font is registered in `document.fonts` and available via `font-family: "customFont"` in CSS.

---

## Type Detection

### From File Extension

The type is determined by the file extension (the part after the last `.`, before any `?` or `#`):

```
https://example.com/app.js         → js
https://example.com/styles.css     → css
https://example.com/data.json      → json
https://example.com/photo.jpg      → jpg
https://example.com/file.js?v=1   → js  (query string ignored)
https://example.com/file.js#hash  → js  (fragment ignored)
```

### URL Pattern Inference (Extensionless URLs)

When a URL has no recognisable file extension, ResourceLoader.js applies heuristics:

| URL contains... | Inferred type |
|-----------------|---------------|
| `/json` | `json` |
| `jsonplaceholder` | `json` |
| `/api` | `json` |
| `/images` | `png` |
| `picsum` | `png` |
| `/img` | `png` |

Examples:

```js
// All inferred as JSON:
ResourceLoader.include([
  'https://jsonplaceholder.typicode.com/todos/1',
  'https://api.example.com/v2/users',
  'https://example.com/data/json/config',
]);

// Inferred as image:
ResourceLoader.include([
  'https://picsum.photos/200/300',
]);
```

:::caution[No matching pattern]
If the URL has no extension and doesn't match any inference pattern, the load fails immediately with `error.type === 'unsupported'`. Ensure your API URLs either end in `.json` or contain `/api` in the path.
:::

---

## Using Loaded Resources

### Scripts and CSS — no extra steps

After loading, scripts are executed automatically by the browser. CSS is applied immediately. No further code is needed.

### JSON — use the parsed data directly

```js
ResourceLoader.include(['https://api.example.com/config.json'], {
  onSuccess: (config) => {
    // config is already a parsed object
    document.title = config.appTitle;
  },
});
```

### Images — append to the DOM

```js
ResourceLoader.include(['https://example.com/hero.jpg'], {
  onSuccess: (url) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Hero image';
    document.getElementById('hero').appendChild(img);
  },
});
```

### Fonts — apply in CSS

```js
await ResourceLoader.include(['https://example.com/fonts/MyFont.woff2']);
// Apply the font — the family name is always "customFont"
document.body.style.fontFamily = '"customFont", sans-serif';
```

### Audio and Video — create an object URL

```js
ResourceLoader.include(['https://example.com/track.mp3'], {
  onSuccess: (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    audio.addEventListener('ended', () => URL.revokeObjectURL(url));
  },
});
```

### PDFs and Binary — trigger a download or embed

```js
ResourceLoader.include(['https://example.com/report.pdf'], {
  onSuccess: (blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'report.pdf';
    link.click();
    URL.revokeObjectURL(url);
  },
});
```
