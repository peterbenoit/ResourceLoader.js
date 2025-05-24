<template>
	<div class="examples py-12">
		<div class="container mx-auto px-4">
			<h1 class="text-3xl font-bold mb-12 text-center">Code Examples</h1>

			<div class="max-w-4xl mx-auto space-y-12">
				<!-- Quick Navigation -->
				<div class="bg-white shadow-md rounded-lg p-6 mb-8">
					<h3 class="text-lg font-semibold mb-4">Jump to example:</h3>
					<div class="flex flex-wrap gap-2">
						<a href="#basic-loading"
							class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors">Basic
							Loading</a>
						<a href="#script-css"
							class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors">Scripts
							& CSS</a>
						<a href="#json-loading"
							class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors">JSON
							Data</a>
						<a href="#image-loading"
							class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors">Images</a>
						<a href="#audio-loading"
							class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors">Audio/Video</a>
						<a href="#cache-busting"
							class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors">Cache
							Busting</a>
						<a href="#error-handling"
							class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors">Error
							Handling</a>
						<a href="#resource-management"
							class="px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white rounded-md transition-colors">Resource
							Management</a>
					</div>
				</div>

				<!-- Basic Example -->
				<section id="basic-loading" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Basic Loading</h2>
						<p class="mb-4">The simplest way to load a resource:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Load a single resource
ResourceLoader.include('https://example.com/script.js')
  .then(() => {
    console.log('Resource loaded successfully');
  });</code></pre>
						</div>

						<p>The library will automatically detect the file type based on the extension and handle it
							appropriately.</p>
					</div>
				</section>

				<!-- JavaScript and CSS Loading -->
				<section id="script-css" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Loading JavaScript and CSS</h2>
						<p class="mb-4">Load multiple JavaScript and CSS files at once:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>ResourceLoader.include(
  [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js'
  ],
  {
    logLevel: 'verbose',
    deferScriptsUntilReady: true
  }
)
  .then(() => {
    console.log('All libraries loaded!');
    // jQuery, normalize.css, and lodash are now available
    $('body').css('background-color', '#f5f5f5');
    const result = _.chunk(['a', 'b', 'c', 'd'], 2);
    console.log(result);
  })
  .catch((error) => {
    console.error('Error loading resources:', error);
  });</code></pre>
						</div>

						<p>This example loads jQuery, normalize.css and lodash, then uses them after they're loaded. The
							<code>deferScriptsUntilReady</code> option ensures scripts aren't loaded until the DOM is
							ready.</p>
					</div>
				</section>

				<!-- JSON Loading -->
				<section id="json-loading" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Loading JSON Data</h2>
						<p class="mb-4">Load and process JSON data:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>ResourceLoader.include(['https://api.example.com/data.json'], {
  onSuccess: (data) => {
    console.log('JSON data loaded:', data);

    // Process the data
    if (data && data.items) {
      data.items.forEach(item => {
        const element = document.createElement('div');
        element.textContent = item.name;
        document.body.appendChild(element);
      });
    }
  },
  onError: (error, url) => {
    console.error(`Error loading JSON from: ${url}`, error.message);
  },
});</code></pre>
						</div>

						<p>When loading JSON, the library automatically parses the response and provides the resulting
							object to your success callback.</p>
					</div>
				</section>

				<!-- Image Loading -->
				<section id="image-loading" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Loading Images</h2>
						<p class="mb-4">Load and display an image:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>ResourceLoader.include(['https://example.com/image.jpg'], {
  onSuccess: (url) => {
    // Create and display the image
    const img = new Image();
    img.src = url;
    img.alt = 'Dynamically loaded image';
    img.className = 'loaded-image';
    document.body.appendChild(img);
    console.log('Image loaded successfully.');
  },
  onError: (error, url) => {
    console.error(`Error loading image from: ${url}`, error.message);

    // Show fallback image
    const fallbackImg = new Image();
    fallbackImg.src = 'fallback.jpg';
    fallbackImg.alt = 'Fallback image';
    document.body.appendChild(fallbackImg);
  },
});</code></pre>
						</div>

						<p>This example loads an image and shows a fallback in case of errors. You can load any image
							format supported by browsers (JPG, PNG, GIF, SVG, WebP).</p>
					</div>
				</section>

				<!-- Audio/Video Loading -->
				<section id="audio-loading" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Loading Audio & Video</h2>
						<p class="mb-4">Load audio files as blobs and create media elements:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Load an audio file
ResourceLoader.include(['https://example.com/audio.mp3'], {
  onSuccess: (data) => {
    // Create a blob URL from the data
    const blobUrl = URL.createObjectURL(data);

    // Create an audio element
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = blobUrl;

    // Add it to the page
    const container = document.getElementById('audio-container');
    container.appendChild(audioElement);

    // Remember to revoke the blob URL when no longer needed
    audioElement.onended = () => {
      URL.revokeObjectURL(blobUrl);
    };
  },
  onError: (error, url) => {
    console.error(`Error loading audio from: ${url}`, error.message);
  },
});</code></pre>
						</div>

						<p>The same approach works for video files - just create a video element instead of an audio
							element.</p>
					</div>
				</section>

				<!-- Cache Busting -->
				<section id="cache-busting" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Cache Busting</h2>
						<p class="mb-4">Prevent browser caching with timestamp parameters:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Enable cache busting for all supported file types
ResourceLoader.include(['script.js', 'styles.css', 'data.json'], {
  cacheBusting: true,
  cacheBustingQuery: `?_cb=${new Date().getTime()}`,
  cacheBustingTypes: ['js', 'css', 'json'],
  // Only apply cache busting to files from your own domain
  restrictCacheBustingToLocal: true
});</code></pre>
						</div>

						<p>This example adds a timestamp parameter to ensure resources are freshly loaded, bypassing the
							browser cache. Useful during development or when you've updated resources.</p>
					</div>
				</section>

				<!-- Error Handling -->
				<section id="error-handling" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Advanced Error Handling</h2>
						<p class="mb-4">Configure retries and detailed error handling:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>ResourceLoader.include(['https://unreliable-server.com/script.js'], {
  // Retry configuration
  retries: 3,
  retryDelay: 2000, // 2 seconds between retries

  // Timeout setting
  timeout: 5000, // 5 second timeout

  // Error handling
  onError: (error, url) => {
    console.error(`Error loading: ${url}`);
    console.error(`Error type: ${error.type}`);
    console.error(`Error message: ${error.message}`);

    // Show error to user
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = `Failed to load resource: ${url}`;
    document.body.appendChild(errorElement);

    // You can check error types
    if (error.type === 'timeout') {
      console.log('Resource timed out, server might be overloaded');
    } else if (error.type === 'network') {
      console.log('Network error, check connection');
    }
  }
});</code></pre>
						</div>

						<p>This example shows advanced error handling with retries, timeouts, and error categorization
							to help diagnose loading issues.</p>
					</div>
				</section>

				<!-- Resource Management -->
				<section id="resource-management" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Resource Management</h2>
						<p class="mb-4">Manage resources with unload, cancel, and state checking:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Check if a resource is loaded
const scriptUrl = 'https://example.com/script.js';
const state = ResourceLoader.getResourceState(scriptUrl);
console.log(`Resource state: ${state}`); // "loaded", "loading", or "unloaded"

// Cancel a resource that's currently loading
ResourceLoader.cancelResource(scriptUrl);

// Unload a previously loaded resource
ResourceLoader.unloadResource(scriptUrl);

// Cancel all pending resource loads
ResourceLoader.cancelAll();</code></pre>
						</div>

						<p>These methods help manage the lifecycle of resources in your application, preventing memory
							leaks and ensuring clean state management.</p>
					</div>
				</section>

				<!-- Demo link -->
				<div class="text-center py-8">
					<p class="mb-4">See ResourceLoader.js in action in this interactive demo:</p>
					<a href="https://codepen.io/peterbenoit/pen/gOVLWXZ" target="_blank" class="btn btn-primary">View on
						CodePen</a>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Examples'
}
</script>
