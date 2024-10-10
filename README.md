# ResourceLoader

ResourceLoader is a flexible JavaScript library that allows for dynamic loading of resources like JavaScript, CSS, images, JSON, and other file types. It supports features like error handling, retries, cache busting, and concurrency control, making it suitable for various applications.

## Features

-   **Dynamic Resource Loading**: Load JS, CSS, images, JSON, fonts, and more dynamically.
-   **Concurrency Control**: Limit the number of concurrent loads to prevent overwhelming the browser.
-   **Retries and Error Handling**: Automatically retry failed resource loads, with customizable retry delays.
-   **Cache Busting**: Optionally append cache-busting query strings to prevent caching issues.
-   **Cross-Origin and Integrity Handling**: Support for crossorigin and integrity attributes for secure resource loading.
-   **Blob and File Loading**: Load and handle binary files like images, audio, and video as blobs.
-   **Callbacks for Success and Failure**: Handle success or failure for each resource with callbacks.

## Installation

You can directly download the `ResourceLoader.js` file or include it from your project.

### Direct Download

You can download the `ResourceLoader.js` file directly from this repository.

### Demo

Some examples of ResourceLoader in action can be found at [CodePen](https://codepen.io/peterbenoit/pen/gOVLWXZ).

### Usage

Include the `ResourceLoader.js` file in your HTML or project:

```html
<script src="path/to/ResourceLoader.js"></script>
```

## Example Usage

### Basic JavaScript and CSS Loading

```javascript
ResourceLoader.include(
    [
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
    ],
    {
        logLevel: 'verbose',
    }
)
    .then(() => {
        console.log('Resources loaded successfully.');
    })
    .catch((error) => {
        console.error('Error loading resources:', error);
    });
```

### JSON Loading

```javascript
ResourceLoader.include(['https://example.com/data.json'], {
    onSuccess: (data) => {
        console.log('JSON data loaded:', data);
    },
    onError: (error, url) => {
        console.error(`Error loading JSON from: ${url}`, error.message);
    },
});
```

### Image Loading

```javascript
ResourceLoader.include(['https://example.com/image.jpg'], {
    onSuccess: (url) => {
        const img = new Image();
        img.src = url;
        document.body.appendChild(img);
        console.log('Image loaded successfully.');
    },
    onError: (error, url) => {
        console.error(`Error loading image from: ${url}`, error.message);
    },
});
```

### Audio Loading as Blob

```javascript
ResourceLoader.include(['https://example.com/audio.mp3'], {
    onSuccess: (data) => {
        const blobUrl = URL.createObjectURL(data);
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = blobUrl;
        document.body.appendChild(audioElement);
    },
    onError: (error, url) => {
        console.error(`Error loading audio from: ${url}`, error.message);
    },
});
```

### Cache Busting

```javascript
ResourceLoader.include(['https://example.com/script.js'], {
    cacheBusting: true,
});
```

## API

### `include(urls, options)`

-   **`urls`**: An array of URLs or a single URL to be loaded.
-   **`options`**:
    -   `logLevel`: (default `'warn'`) Log level. Can be `'silent'`, `'warn'`, or `'verbose'`.
    -   `onSuccess`: Callback when the resource(s) load successfully.
    -   `onError`: Callback when the resource fails to load.
    -   `retries`: Number of times to retry loading on failure.
    -   `retryDelay`: Delay between retry attempts.
    -   `deferScriptsUntilReady`: If true, defers script loading until DOM is ready.
    -   `maxConcurrency`: Limit concurrent resource loads.
    -   `cacheBusting`: Append a cache-busting query parameter to the resource URL.
    -   `crossorigin`: Set cross-origin for JS/CSS resources.
    -   `attributes`: Additional attributes to set on the element (e.g., integrity).

### `unloadResource(url)`

Unloads a resource from the page.

```javascript
ResourceLoader.unloadResource('https://example.com/script.js');
```

### `cancelResource(url)`

Cancels the loading of a resource.

```javascript
ResourceLoader.cancelResource('https://example.com/script.js');
```

### `cancelAll()`

Cancels all pending resource loads.

```javascript
ResourceLoader.cancelAll();
```

### `getResourceState(url)`

Gets the current state of a resource (`"loading"`, `"loaded"`, `"unloaded"`).

```javascript
const state = ResourceLoader.getResourceState('https://example.com/script.js');
console.log(state); // "loaded"
```

## License

This project is licensed under the MIT License.
