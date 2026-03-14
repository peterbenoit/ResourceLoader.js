---
title: Installation
description: Every way to add ResourceLoader.js to your project — CDN, npm, or direct download.
---

ResourceLoader.js is a single JavaScript file with no dependencies. You can add it to any project in minutes.

## Option 1: CDN (Recommended for Beginners)

The easiest way to get started is to include the library directly from a CDN. Paste this `<script>` tag into your HTML file, inside the `<head>` section:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>

  <!-- Add ResourceLoader.js here -->
  <script src="https://cdn.jsdelivr.net/npm/resourceloader-js/resourceLoader.js"></script>
</head>
<body>
  <script>
    // ResourceLoader is now available globally
    ResourceLoader.include(['https://example.com/app.css']);
  </script>
</body>
</html>
```

### Latest vs. Pinned Versions

| CDN | URL | Notes |
|-----|-----|-------|
| jsDelivr (latest) | `https://cdn.jsdelivr.net/npm/resourceloader-js/resourceLoader.js` | Always the newest release |
| jsDelivr (pinned) | `https://cdn.jsdelivr.net/npm/resourceloader-js@1.0.2/resourceLoader.js` | Locked to a specific version |
| unpkg (latest) | `https://unpkg.com/resourceloader-js/resourceLoader.js` | Always the newest release |
| unpkg (pinned) | `https://unpkg.com/resourceloader-js@1.0.2/resourceLoader.js` | Locked to a specific version |

:::tip[Which should I use?]
- **Development**: Use the **latest** URL for convenience.
- **Production**: Use a **pinned** URL so a library update can never break your site unexpectedly. Replace `1.0.2` with the current version when you upgrade.
:::

---

## Option 2: npm

Install the package from the npm registry:

```sh
npm install resourceloader-js
```

Once installed, you can include it in your project in two ways.

### Browser global (via a bundler or `<script src>`)

If you are using a bundler (Webpack, Vite, Rollup, Parcel), you can import it in your entry file:

```js
import 'resourceloader-js';

// The global ResourceLoader is now available
ResourceLoader.include(['https://example.com/app.css']);
```

Or if your bundler exposes modules as named exports, you may use:

```js
import ResourceLoader from 'resourceloader-js';
```

### CommonJS (Node.js / server-side rendering)

```js
const ResourceLoader = require('resourceloader-js');
```

:::note
ResourceLoader.js is a **browser library**. It uses browser APIs (`document`, `FontFace`, `fetch`, `AbortController`). Importing it in a Node.js environment without a DOM shim (like jsdom) will not work as expected. It is primarily designed to run in a browser context.
:::

---

## Option 3: Direct Download

1. Download `resourceLoader.js` from the [GitHub repository](https://github.com/peterbenoit/ResourceLoader.js/blob/main/resourceLoader.js).
2. Place it in your project, for example at `./js/resourceLoader.js`.
3. Reference it with a `<script>` tag:

```html
<script src="./js/resourceLoader.js"></script>
```

---

## Verify the Installation

After including the library, open your browser's developer console and run:

```js
console.log(typeof ResourceLoader); // "object"
console.log(typeof ResourceLoader.include); // "function"
```

If you see `"object"` and `"function"`, the library is loaded and ready to use.

---

## Next Steps

Now that ResourceLoader.js is installed, head to the [Quick Start guide](/getting-started/quick-start/) to load your first resources in a few lines of code.
