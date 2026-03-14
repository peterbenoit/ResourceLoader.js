---
title: Quick Start
description: Go from zero to loading resources in under 5 minutes with a complete, copy-pasteable example.
---

This guide walks you through loading your first resources with ResourceLoader.js. By the end, you will have a working HTML page that loads a stylesheet, fetches JSON data, handles an error, and checks a resource's state.

## Step 1: Create an HTML File

Create a new file called `index.html` and paste in this starter template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ResourceLoader.js Quick Start</title>

  <!-- 1. Include ResourceLoader.js from the CDN -->
  <script src="https://cdn.jsdelivr.net/npm/resourceloader-js/resourceLoader.js"></script>
</head>
<body>
  <h1>Quick Start Demo</h1>
  <div id="output"></div>

  <script>
    // Your ResourceLoader code goes here (Steps 2–5 below)
  </script>
</body>
</html>
```

Open this file in your browser. You will see a plain "Quick Start Demo" heading — that is expected for now.

---

## Step 2: Load a Stylesheet

Let's load a stylesheet dynamically. Add this inside your `<script>` block:

```js
ResourceLoader.include(['https://cdn.jsdelivr.net/npm/normalize.css/normalize.css'], {
  logLevel: 'verbose', // Print messages to the console so we can see what's happening
})
.then(() => {
  console.log('Stylesheet loaded successfully!');
});
```

Refresh the page and open the browser console. You should see "Stylesheet loaded successfully!" and the page styles will be reset by normalize.css.

---

## Step 3: Fetch JSON Data

ResourceLoader.js can also fetch JSON from an API. When it does, the `onSuccess` callback receives the **parsed data** (not just a URL):

```js
ResourceLoader.include(['https://jsonplaceholder.typicode.com/todos/1'], {
  onSuccess: (data) => {
    // data is already a parsed JavaScript object — no JSON.parse() needed
    console.log('JSON data received:', data);

    // Display it on the page
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
  },
});
```

After refreshing, the `<div id="output">` will show the JSON response from the public API.

---

## Step 4: Handle an Error

What happens when a resource fails to load? Let's intentionally load a bad URL and handle it gracefully:

```js
ResourceLoader.include(['https://thisurldoesnotexist.example.com/missing.js'], {
  onError: (error, url) => {
    // error.type is one of: 'network', 'timeout', 'abort', 'unsupported'
    console.warn(`Could not load ${url} — ${error.type}: ${error.message}`);
  },
})
.catch((aggregateError) => {
  // The Promise also rejects with a summary of all failures
  console.log('Caught aggregate error:', aggregateError.type); // 'aggregate'
});
```

:::tip
The `onError` callback fires **immediately** when a specific resource fails. The Promise rejection fires **after all resources have either succeeded or failed**. You can use both at the same time.
:::

---

## Step 5: Check Resource State

After a resource loads, you can query its state with `getResourceState()`:

```js
const cssUrl = 'https://cdn.jsdelivr.net/npm/normalize.css/normalize.css';

// After loading from Step 2:
console.log(ResourceLoader.getResourceState(cssUrl));
// → 'loaded'

// For a URL we've never seen:
console.log(ResourceLoader.getResourceState('https://never-loaded.example.com/x.js'));
// → 'unloaded'
```

---

## Complete Working Example

Here is everything from the steps above combined into one self-contained file you can copy and open directly in a browser:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ResourceLoader.js Quick Start</title>
  <script src="https://cdn.jsdelivr.net/npm/resourceloader-js/resourceLoader.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    .error { color: #dc2626; }
    .success { color: #16a34a; }
  </style>
</head>
<body>
  <h1>ResourceLoader.js Quick Start</h1>
  <div id="status"></div>
  <pre id="output">Loading...</pre>

  <script>
    const status = document.getElementById('status');
    const output = document.getElementById('output');

    // Load a stylesheet
    ResourceLoader.include(['https://cdn.jsdelivr.net/npm/normalize.css/normalize.css'])
      .then(() => {
        const p = document.createElement('p');
        p.className = 'success';
        p.textContent = '✓ Stylesheet (normalize.css) loaded';
        status.appendChild(p);
      });

    // Fetch JSON data
    ResourceLoader.include(['https://jsonplaceholder.typicode.com/todos/1'], {
      onSuccess: (data) => {
        output.textContent = JSON.stringify(data, null, 2);

        const p = document.createElement('p');
        p.className = 'success';
        p.textContent = '✓ JSON data fetched from API';
        status.appendChild(p);
      },
    });

    // Intentionally load a bad URL to demonstrate error handling
    ResourceLoader.include(['https://thisurldoesnotexist.example.com/missing.js'], {
      onError: (error, url) => {
        const p = document.createElement('p');
        p.className = 'error';
        p.textContent = `✗ Error loading missing.js — ${error.type}: ${error.message}`;
        status.appendChild(p);
      },
    }).catch(() => {/* handled via onError */});

    // Check resource state after a short delay
    setTimeout(() => {
      const cssUrl = 'https://cdn.jsdelivr.net/npm/normalize.css/normalize.css';
      const state = ResourceLoader.getResourceState(cssUrl);
      console.log(`State of normalize.css: ${state}`); // 'loading' or 'loaded'
    }, 500);
  </script>
</body>
</html>
```

---

## What's Next?

Now that you have the basics down, explore the guides to go deeper:

- [Loading Scripts & CSS](/guides/loading-scripts-and-css/) — security attributes, DOM placement, deduplication
- [Loading Data (JSON)](/guides/loading-json/) — using the parsed data response
- [Error Handling](/guides/error-handling/) — all error types and how to recover
- [Retries & Timeouts](/guides/retries-and-timeouts/) — make your loads resilient
