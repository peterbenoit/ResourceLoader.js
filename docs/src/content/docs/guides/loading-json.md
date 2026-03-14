---
title: Loading Data (JSON)
description: Fetch and use JSON data from APIs and files with automatic parsing and full error handling.
---

ResourceLoader.js fetches JSON using the Fetch API and automatically parses the response. Unlike scripts and stylesheets, when a JSON resource loads successfully, the `onSuccess` callback and the Promise resolved value both receive the **parsed JavaScript object** — not a URL string.

## Basic JSON Fetch

```js
ResourceLoader.include(['https://api.example.com/config.json'], {
  onSuccess: (data) => {
    // data is already a parsed object — no JSON.parse() needed
    console.log(data.appTitle); // access properties directly
  },
  onError: (error, url) => {
    console.error(`Failed to load ${url}:`, error.message);
  },
});
```

## Using async/await

```js
async function loadConfig() {
  const results = await ResourceLoader.include([
    'https://api.example.com/config.json',
  ]);

  // For JSON, results[0].value is the parsed object
  const config = results[0].value;
  console.log('Config loaded:', config);
  return config;
}
```

## The `onSuccess` Callback for JSON

The `onSuccess` callback fires as soon as the resource finishes loading. For JSON, it receives the parsed data immediately:

```js
ResourceLoader.include(['https://jsonplaceholder.typicode.com/users'], {
  onSuccess: (users) => {
    // users is an array of user objects
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      document.getElementById('user-list').appendChild(li);
    });
  },
});
```

## Loading Multiple JSON Files

When loading multiple JSON files in one call, the `onSuccess` callback fires once per resource as each finishes. To associate data with a specific URL, use the `.then()` results array:

```js
const [usersResult, postsResult] = await ResourceLoader.include([
  'https://jsonplaceholder.typicode.com/users',
  'https://jsonplaceholder.typicode.com/posts',
]);

const users = usersResult.value;
const posts = postsResult.value;

console.log(`${users.length} users, ${posts.length} posts`);
```

:::note
The results array order matches the URL array order, regardless of which resource finished loading first.
:::

## Mixing JSON with Scripts and CSS

You can load different resource types in the same `include()` call. The `onSuccess` callback fires once per resource:

```js
ResourceLoader.include([
  'https://cdn.example.com/app.css',
  'https://api.example.com/settings.json',
  'https://cdn.example.com/app.js',
], {
  onSuccess: (data) => {
    // Fires three times — once per resource
    // For CSS and JS: data is the URL string
    // For JSON: data is the parsed object
    if (typeof data === 'object') {
      applySettings(data); // JSON data
    }
  },
});
```

## Extensionless API URLs

Many APIs return JSON from URLs that don't end in `.json`. ResourceLoader.js uses heuristics to infer the type from the URL pattern:

| URL Pattern | Inferred as |
|-------------|-------------|
| URL contains `/json` | JSON |
| URL contains `jsonplaceholder` | JSON |
| URL contains `/api` | JSON |
| URL contains `/images`, `picsum`, or `/img` | Image |

Examples:

```js
// These are all inferred as JSON automatically:
ResourceLoader.include([
  'https://jsonplaceholder.typicode.com/todos/1',  // contains 'jsonplaceholder'
  'https://api.example.com/v2/users',               // contains '/api'
  'https://example.com/data/json/config',           // contains '/json'
]);
```

:::caution[Extensionless URL limitation]
If your API URL doesn't match any of these patterns and has no `.json` extension, ResourceLoader.js may not be able to infer the type correctly. In that case, add a `.json` extension or ensure your URL contains `/api` or `/json` in the path.

For example, `https://example.com/endpoint` would not be inferred as JSON and the load would fail with an `unsupported` error.
:::

## Error Handling for JSON

JSON loading can fail in several ways:

```js
ResourceLoader.include(['https://api.example.com/data.json'], {
  timeout: 5000,
  retries: 2,
  onError: (error, url) => {
    switch (error.type) {
      case 'network':
        // HTTP 404, 500, or no connection
        showError('Could not reach the server. Please check your connection.');
        break;
      case 'timeout':
        // Took longer than 5000ms
        showError('Request timed out. The server may be slow.');
        break;
      case 'abort':
        // cancelResource() was called
        console.log('Request was cancelled.');
        break;
    }
  },
});
```

See [Error Handling](/guides/error-handling/) for the complete guide to error types.

## Real-World Example: Load Config Before Init

A common pattern is to load configuration before initializing an application:

```js
async function init() {
  let config;

  try {
    const results = await ResourceLoader.include([
      '/config/app.json',
      'https://cdn.example.com/app.css',
      'https://cdn.example.com/app.js',
    ], {
      retries: 1,
      timeout: 8000,
    });

    // Find the JSON result by checking value type
    const configResult = results.find(r => typeof r.value === 'object');
    config = configResult?.value ?? {};
  } catch (error) {
    console.error('Failed to load required resources:', error);
    showFallbackUI();
    return;
  }

  // All resources loaded — initialize the app
  startApp(config);
}

init();
```
