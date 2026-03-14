---
title: Loading Media & Files
description: Load audio, video, fonts, images, PDFs, and binary files — and use them directly in the browser.
---

import { Tabs, TabItem, Aside } from '@astrojs/starlight/components';

ResourceLoader.js can load media and binary files using the Fetch API, returning the raw data as a `Blob`. This lets you play audio, display video, trigger downloads, or process binary data entirely in the browser without a server-side proxy.

## How Blob Loading Works

For binary types (audio, video, PDF, zip, bin), ResourceLoader.js:

1. Calls `fetch(url)`
2. Reads the response as `response.blob()`
3. Passes the resulting `Blob` to your `onSuccess` callback

This means the `onSuccess` callback and the Promise resolved value contain a **`Blob` object**, not a URL string.

```js
ResourceLoader.include(['https://example.com/audio.mp3'], {
  onSuccess: (blob) => {
    console.log(blob instanceof Blob); // true
    console.log(blob.type);           // 'audio/mpeg'
  },
});
```

To use the Blob in the browser, convert it to an object URL with `URL.createObjectURL(blob)`.

<Aside type="caution" title="Memory management">
Object URLs created with `URL.createObjectURL()` persist until the page is unloaded or you explicitly call `URL.revokeObjectURL(objectUrl)`. Always revoke object URLs when you're done with them to prevent memory leaks.
</Aside>

---

## Images

Images use a different mechanism than other binary files. ResourceLoader.js creates an `<img>` element (not a fetch), so the `onSuccess` callback receives the **URL string** (same as scripts and CSS), not a Blob.

```js
ResourceLoader.include(['https://example.com/photo.jpg'], {
  onSuccess: (url) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Loaded image';
    document.body.appendChild(img);
  },
});
```

Supported image formats: `jpg`, `jpeg`, `png`, `gif`, `svg`, `webp`.

---

## Audio

<Tabs>
  <TabItem label="Basic playback">

```js
ResourceLoader.include(['https://example.com/notification.mp3'], {
  onSuccess: (blob) => {
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    audio.play();

    // Revoke the URL after playback ends
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(objectUrl);
    });
  },
  onError: (error, url) => {
    console.error(`Audio load failed: ${error.message}`);
  },
});
```

  </TabItem>
  <TabItem label="Audio element in DOM">

```js
ResourceLoader.include(['https://example.com/song.mp3'], {
  onSuccess: (blob) => {
    const objectUrl = URL.createObjectURL(blob);

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = objectUrl;
    document.getElementById('player-container').appendChild(audio);

    // Clean up when the component is removed
    // URL.revokeObjectURL(objectUrl);
  },
});
```

  </TabItem>
</Tabs>

Supported audio formats: `mp3`, `ogg`, `wav`.

---

## Video

```js
ResourceLoader.include(['https://example.com/intro.mp4'], {
  timeout: 30000, // Videos can be large — increase the timeout
  onSuccess: (blob) => {
    const objectUrl = URL.createObjectURL(blob);

    const video = document.createElement('video');
    video.controls = true;
    video.src = objectUrl;
    video.style.maxWidth = '100%';
    document.getElementById('video-container').appendChild(video);
  },
  onError: (error, url) => {
    if (error.type === 'timeout') {
      console.error('Video download timed out — consider streaming instead.');
    } else {
      console.error(`Video load failed: ${error.message}`);
    }
  },
});
```

Supported video formats: `mp4`, `avi`, `webm`.

:::tip[Large files]
For large video files, consider whether loading via `ResourceLoader.include()` is appropriate. The entire file is downloaded into memory as a Blob. For streaming video, use a `<video>` element with a `src` attribute directly — ResourceLoader.js is best suited for smaller media clips or assets where offline availability matters.
:::

---

## Fonts

ResourceLoader.js loads fonts using the [FontFace API](https://developer.mozilla.org/en-US/docs/Web/API/FontFace), which registers the font with `document.fonts`. Unlike other types, the `onSuccess` callback does not receive any data.

```js
ResourceLoader.include(['https://example.com/fonts/MyFont.woff2'])
  .then(() => {
    // The font is now registered with document.fonts
    // Apply it in CSS or inline style
    document.body.style.fontFamily = '"customFont", sans-serif';
  });
```

Supported font formats: `woff`, `woff2`.

<Aside type="caution" title="Font family name">
In the current version of ResourceLoader.js, the font family name is hardcoded as `"customFont"`. To use a loaded font, reference that exact name in your CSS: `font-family: "customFont", fallback-font, sans-serif;`
</Aside>

---

## PDFs

```js
ResourceLoader.include(['https://example.com/report.pdf'], {
  onSuccess: (blob) => {
    // Option 1: Open in the browser's PDF viewer
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank');

    // Option 2: Trigger a download
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'report.pdf';
    link.click();
    URL.revokeObjectURL(objectUrl);
  },
});
```

---

## ZIP and Binary Files

```js
ResourceLoader.include(['https://example.com/assets.zip'], {
  onSuccess: (blob) => {
    // Trigger a download
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'assets.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  },
});
```

Supported binary formats: `pdf`, `zip`, `bin`.

---

## Summary: `onSuccess` Callback Values by Type

| Resource Type | Loading Mechanism | `onSuccess` receives |
|---------------|------------------|----------------------|
| `js` | `<script>` element | URL string |
| `css` | `<link>` element | URL string |
| `json` | `fetch()` + `response.json()` | Parsed object |
| `jpg`, `jpeg`, `png`, `gif`, `svg`, `webp` | `<img>` element | URL string |
| `woff`, `woff2` | FontFace API | nothing (`undefined`) |
| `mp3`, `ogg`, `wav` | `fetch()` + `response.blob()` | `Blob` |
| `mp4`, `avi`, `webm` | `fetch()` + `response.blob()` | `Blob` |
| `pdf`, `zip`, `bin` | `fetch()` + `response.blob()` | `Blob` |

See [Supported File Types](/reference/supported-types/) for the complete reference table.
