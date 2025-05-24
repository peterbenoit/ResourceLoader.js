<template>
	<div class="examples py-12">
		<div class="container mx-auto px-4">
			<h1 class="text-3xl font-bold mb-12 text-center">Interactive Examples</h1>

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
ResourceLoader.include('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css')
  .then(() => {
    console.log('Resource loaded successfully');
    // Apply animation to the result element
    document.getElementById('basic-result').classList.add('animate__animated', 'animate__bounce');
  });</code></pre>
						</div>

						<div class="flex items-center mt-6 mb-4">
							<button @click="loadBasicExample"
								class="mr-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
								Try It
							</button>
							<div id="basic-result" class="p-4 bg-gray-100 rounded flex-1 text-center font-medium">
								{{ basicResultText }}
							</div>
						</div>

						<p class="mt-4">The library will automatically detect the file type based on the extension and
							handle it
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
    $('#jquery-demo').css('color', '#2c7be5').fadeOut(500).fadeIn(500);
    const result = _.chunk(['a', 'b', 'c', 'd'], 2);
    $('#lodash-demo').text(JSON.stringify(result));
  })
  .catch((error) => {
    console.error('Error loading resources:', error);
  });</code></pre>
						</div>

						<div class="flex flex-col md:flex-row items-center mt-6 mb-4 gap-4">
							<button @click="loadJsAndCss"
								class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
								Try It
							</button>
							<div class="flex-1 flex gap-6">
								<div id="jquery-demo" class="p-4 bg-gray-100 rounded flex-1 text-center font-medium">
									jQuery will animate this
								</div>
								<div class="p-4 bg-gray-100 rounded flex-1">
									Lodash result: <span id="lodash-demo" class="font-mono"></span>
								</div>
							</div>
						</div>

						<p class="mt-4">This example loads jQuery, normalize.css and lodash, then uses them after
							they're loaded. The
							<code>deferScriptsUntilReady</code> option ensures scripts aren't loaded until the DOM is
							ready.
						</p>
					</div>
				</section> <!-- JSON Loading -->
				<section id="json-loading" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Loading JSON Data</h2>
						<p class="mb-4">Load and process JSON data:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Using a public JSON API for testing
ResourceLoader.include(['https://jsonplaceholder.typicode.com/users'], {
  onSuccess: (data) => {
    console.log('JSON data loaded:', data);

    // Process the data
    if (data && data.length) {
      const container = document.getElementById('json-results');
      container.innerHTML = ''; // Clear previous results

      data.slice(0, 5).forEach(user => {
        const card = document.createElement('div');
        card.className = 'p-3 border rounded mb-2 bg-white';
        card.innerHTML = `
          <div class="font-medium">${user.name}</div>
          <div class="text-sm text-gray-500">${user.email}</div>
        `;
        container.appendChild(card);
      });
    }
  },
  onError: (error, url) => {
    console.error(`Error loading JSON from: ${url}`, error.message);
    document.getElementById('json-results').innerHTML = `<div class="text-center p-6 bg-red-50 text-red-500 rounded"><p>Failed to load data:</p><p class="text-sm">${error.message}</p></div>`;
  },
});</code></pre>
						</div>

						<div class="flex flex-col md:flex-row mt-6 mb-4 gap-4">
							<div class="md:w-1/4">
								<button @click="loadJsonExample"
									class="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
									Load JSON Data
								</button>
								<div class="mt-3 text-sm text-gray-500">
									Loads user data from JSONPlaceholder API
								</div>
							</div>
							<div id="json-results" class="flex-1 bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
								Result will appear here...
							</div>
						</div>

						<p class="mt-4">When loading JSON, the library automatically parses the response and provides
							the resulting
							object to your success callback.</p>
					</div>
				</section>

				<!-- Image Loading -->
				<section id="image-loading" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Loading Images</h2>
						<p class="mb-4">Load and display an image:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Using a sample image from picsum.photos
ResourceLoader.include(['https://picsum.photos/400/300'], {
  onSuccess: (url) => {
    // Create and display the image
    const container = document.getElementById('image-container');
    container.innerHTML = ''; // Clear previous results

    const img = new Image();
    img.src = url;
    img.alt = 'Dynamically loaded image';
    img.className = 'w-full h-auto rounded shadow-md';
    img.style.maxHeight = '300px';
    img.style.objectFit = 'cover';

    container.appendChild(img);
    console.log('Image loaded successfully.');
  },
  onError: (error, url) => {
    console.error(`Error loading image from: ${url}`, error.message);

    // Show error message
    const container = document.getElementById('image-container');
    container.innerHTML = `
      <div class="text-center p-6 bg-red-50 text-red-500 rounded"><p>Failed to load image</p><p class="text-sm">${error.message}</p></div>
    `;
  },
});</code></pre>
						</div>

						<div class="flex flex-col md:flex-row mt-6 mb-4 gap-4">
							<div class="md:w-1/4">
								<button @click="loadImageExample"
									class="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
									Load Random Image
								</button>
								<button @click="loadImageExampleWithError"
									class="w-full px-4 py-2 mt-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
									Test With Error
								</button>
							</div>
							<div id="image-container"
								class="flex-1 bg-gray-100 p-4 rounded flex items-center justify-center min-h-[200px]">
								<div class="text-gray-400">Image will appear here...</div>
							</div>
						</div>

						<p class="mt-4">This example loads an image from a random image service. You can load any image
							format supported by browsers (JPG, PNG, GIF, SVG, WebP).</p>
					</div>
				</section>

				<!-- Audio/Video Loading -->
				<section id="audio-loading" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Loading Audio & Video</h2>
						<p class="mb-4">Load audio files and create media elements:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Load an audio file from a Creative Commons source
ResourceLoader.include(['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'], {
  onSuccess: (url) => {
    // For non-binary loading, we get the URL directly
    const audioContainer = document.getElementById('audio-container');
    audioContainer.innerHTML = ''; // Clear previous results

    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = url;
    audioElement.className = 'w-full';

    const sourceInfo = document.createElement('div');
    sourceInfo.className = 'mt-2 text-sm text-gray-500';
    sourceInfo.textContent = 'Audio from SoundHelix.com (CC-BY)';

    audioContainer.appendChild(audioElement);
    audioContainer.appendChild(sourceInfo);
  },
  onError: (error, url) => {
    console.error(`Error loading audio from: ${url}`, error.message);
    document.getElementById('audio-container').innerHTML = `<div class="text-center p-6 bg-red-50 text-red-500 rounded"><p>Failed to load audio:</p><p class="text-sm">${error.message}</p></div>`;
  },
});</code></pre>
						</div>

						<div class="flex flex-col md:flex-row mt-6 mb-4 gap-4">
							<div class="md:w-1/4">
								<button @click="loadAudioExample"
									class="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
									Load Audio File
								</button>
							</div>
							<div id="audio-container"
								class="flex-1 bg-gray-100 p-4 rounded min-h-[80px] flex items-center justify-center">
								<div class="text-gray-400">Audio player will appear here...</div>
							</div>
						</div>

						<p class="mt-4">The same approach works for video files - just create a video element instead of
							an audio
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
ResourceLoader.include(['/sample-script.js', '/sample-style.css', '/sample-data.json'], {
  cacheBusting: true,
  cacheBustingQuery: `?_cb=${new Date().getTime()}`,
  cacheBustingTypes: ['js', 'css', 'json'],
  // Only apply cache busting to files from your own domain
  restrictCacheBustingToLocal: true,
  onSuccess: (url) => {
    document.getElementById('cache-results').innerHTML +=
      `<div class="text-green-500">✓ Loaded: ${url}</div>`;

    // Extract the cache busting parameter to show it worked
    if (url.includes('?_cb=')) {
      const timestamp = url.split('?_cb=')[1];
      document.getElementById('cache-timestamp').textContent = timestamp;
    }
  }
});</code></pre>
						</div>

						<div class="flex flex-col md:flex-row mt-6 mb-4 gap-4">
							<div class="md:w-1/4">
								<button @click="loadWithCacheBusting"
									class="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
									Load with Cache Busting
								</button>
								<div class="mt-2 text-sm text-gray-500">
									Check the network tab in dev tools to see the cache busting parameter
								</div>
							</div>
							<div class="flex-1">
								<div id="cache-results" class="bg-gray-100 rounded p-4 mb-2 max-h-40 overflow-auto">
									<div class="text-gray-400">Results will appear here...</div>
								</div>
								<div class="p-2 bg-gray-200 rounded text-sm">
									<span>Timestamp parameter: </span>
									<span id="cache-timestamp" class="font-mono">None</span>
								</div>
							</div>
						</div>

						<p class="mt-4">This example adds a timestamp parameter to ensure resources are freshly loaded,
							bypassing the
							browser cache. Useful during development or when you've updated resources.</p>
					</div>
				</section>

				<!-- Error Handling -->
				<section id="error-handling" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Advanced Error Handling</h2>
						<p class="mb-4">Configure retries and detailed error handling:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Attempt to load from a non-existent URL with retry logic
ResourceLoader.include(['https://non-existent-domain-123456.com/script.js'], {
  // Retry configuration
  retries: 2,
  retryDelay: 1000, // 1 second between retries

  // Timeout setting - shorter for demo purposes
  timeout: 3000, // 3 second timeout

  // Error handling
  onError: (error, url) => {
    console.error(`Error loading: ${url}`);
    console.error(`Error type: ${error.type}`);
    console.error(`Error message: ${error.message}`);

    // Show error to user
    const errorContainer = document.getElementById('error-container');
    const errorElement = document.createElement('div');
    errorElement.className = 'p-2 border-b border-red-200';

    let errorInfo = `<div class="font-medium">Failed: ${url}</div>`;
    errorInfo += `<div class="text-sm">Error type: ${error.type || 'unknown'}</div>`;
    errorInfo += `<div class="text-sm text-red-500">${error.message}</div>`;

    errorElement.innerHTML = errorInfo;
    errorContainer.appendChild(errorElement);
  }
});</code></pre>
						</div>

						<div class="flex flex-col md:flex-row mt-6 mb-4 gap-4">
							<div class="md:w-1/4">
								<button @click="loadErrorExample"
									class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
									Test Error Handling
								</button>
								<div class="mt-2 text-sm text-gray-500">
									This will intentionally try to load from a non-existent domain and show the error
									handling
								</div>
							</div>
							<div class="flex-1">
								<div class="font-medium mb-2">Error log:</div>
								<div id="error-container"
									class="bg-red-50 p-2 border border-red-200 rounded max-h-60 overflow-y-auto">
									<div class="text-gray-400 p-2">Error results will appear here...</div>
								</div>
							</div>
						</div>

						<p class="mt-4">This example shows advanced error handling with retries, timeouts, and error
							categorization
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
const cssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';

// Get the current state
const state = ResourceLoader.getResourceState(cssUrl);
document.getElementById('state-display').textContent = state;

// Load a resource to demonstrate state changes
ResourceLoader.include([cssUrl])
  .then(() => {
    document.getElementById('state-display').textContent = 'loaded';
  });

// Unload the resource
function unloadResource() {
  ResourceLoader.unloadResource(cssUrl);
  document.getElementById('state-display').textContent = 'unloaded';
}

// Cancel all pending resource loads
function cancelAllLoads() {
  ResourceLoader.cancelAll();
  document.getElementById('state-display').textContent = 'all cancelled';
}</code></pre>
						</div>

						<div class="flex flex-col md:flex-row mt-6 mb-4 gap-4">
							<div class="md:w-1/3">
								<button @click="loadResourceStateExample"
									class="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 mb-2">
									Load Resource
								</button>
								<button @click="unloadResourceExample"
									class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mb-2">
									Unload Resource
								</button>
								<button @click="checkResourceStateExample"
									class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
									Check State
								</button>
							</div>
							<div class="flex-1">
								<div class="p-4 bg-gray-100 rounded">
									<p>Current resource state: <span id="state-display"
											class="font-medium">unknown</span></p>
									<p class="mt-2 text-gray-500 text-sm">States can be: "loaded", "loading", or
										"unloaded"</p>
									<p class="mt-4" id="state-message"></p>
								</div>
							</div>
						</div>

						<p class="mt-4">These methods help manage the lifecycle of resources in your application,
							preventing memory
							leaks and ensuring clean state management.</p>
					</div>
				</section>

				<!-- Local Resources Example -->
				<section id="local-resources" class="bg-white shadow-md rounded-lg overflow-hidden">
					<div class="p-6">
						<h2 class="text-2xl font-bold text-primary mb-4">Loading Local Resources</h2>
						<p class="mb-4">Load JavaScript, CSS, and JSON files from your own server:</p>

						<div class="bg-gray-50 p-4 mb-6 rounded-md">
							<pre class="text-sm overflow-x-auto"><code>// Load local resources (relative to your site)
ResourceLoader.include([
  '/sample-script.js',   // Local JavaScript file
  '/sample-style.css',   // Local CSS file
  '/sample-data.json'    // Local JSON file
])
.then(() => {
  // Access the JavaScript functionality
  if (window.ResourceLoaderTest) {
    document.getElementById('script-output').textContent =
      window.ResourceLoaderTest.sayHello();
  }

  // Apply the CSS
  const cssDemo = document.getElementById('css-demo');
  cssDemo.className = 'resource-loader-test';

  // Display the JSON data
  fetch('/sample-data.json')
    .then(response => response.json())
    .then(data => {
      document.getElementById('json-output').textContent =
        JSON.stringify(data, null, 2);
    });
});</code></pre>
						</div>

						<div class="flex flex-col md:flex-row mt-6 mb-4 gap-4">
							<div class="md:w-1/4">
								<button @click="loadLocalResources"
									class="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/80">
									Load Local Resources
								</button>
							</div>
							<div class="flex-1 grid md:grid-cols-2 gap-4">
								<div>
									<div id="css-demo" class="p-4 bg-gray-100 rounded h-full">
										<h4>CSS Demo</h4>
										<p>This box will be styled when the CSS loads</p>
									</div>
								</div>
								<div class="flex flex-col gap-2">
									<div class="p-4 bg-gray-100 rounded">
										<div class="font-medium mb-1">Script Output:</div>
										<div id="script-output" class="text-sm font-mono">Script not loaded yet</div>
									</div>
									<div class="p-4 bg-gray-100 rounded flex-1">
										<div class="font-medium mb-1">JSON Data:</div>
										<pre id="json-output"
											class="text-xs font-mono overflow-auto max-h-40">JSON not loaded yet</pre>
									</div>
								</div>
							</div>
						</div>

						<p class="mt-4">Loading resources from your own domain avoids cross-origin issues and gives you
							complete control over the resources being loaded.</p>
					</div>
				</section>

				<!-- Additional info -->
				<div class="text-center py-8">
					<p class="mb-4">These interactive examples demonstrate how to use ResourceLoader.js in your
						projects.</p>
					<p class="text-gray-500">Each example can be run directly in your browser to see the functionality
						in action.</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Examples',
	data() {
		return {
			basicResultText: 'Resource will be loaded here...'
		}
	},
	methods: {
		loadBasicExample() {
			this.basicResultText = 'Loading resource...';

			// Ensure ResourceLoader is defined (it's included in index.html)
			if (typeof window.ResourceLoader !== 'undefined') {
				window.ResourceLoader.include('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css')
					.then(() => {
						console.log('Resource loaded successfully');
						this.basicResultText = 'Resource loaded successfully!';
						// Apply animation to the result element
						document.getElementById('basic-result').classList.add('animate__animated', 'animate__bounce');
					})
					.catch(error => {
						this.basicResultText = `Error: ${error.message}`;
					});
			} else {
				this.basicResultText = 'ResourceLoader is not defined. Please check your setup.';
			}
		},

		loadJsAndCss() {
			if (typeof window.ResourceLoader !== 'undefined') {
				window.ResourceLoader.include(
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
						window.$('#jquery-demo').css('color', '#2c7be5').fadeOut(500).fadeIn(500);
						const result = window._.chunk(['a', 'b', 'c', 'd'], 2);
						window.$('#lodash-demo').text(JSON.stringify(result));
					})
					.catch((error) => {
						console.error('Error loading resources:', error);
						document.getElementById('jquery-demo').textContent = 'Error loading libraries';
					});
			}
		},

		loadJsonExample() {
			if (typeof window.ResourceLoader !== 'undefined') {
				// Using a public JSON API for testing
				const resultsEl = document.getElementById('json-results');
				resultsEl.innerHTML = '<div class="text-center text-gray-500">Loading data...</div>';

				window.ResourceLoader.include(['https://jsonplaceholder.typicode.com/users'], {
					onSuccess: (data) => {
						console.log('JSON data loaded:', data);

						// Process the data
						if (data && data.length) {
							resultsEl.innerHTML = ''; // Clear previous results

							data.slice(0, 5).forEach(user => {
								const card = document.createElement('div');
								card.className = 'p-3 border rounded mb-2 bg-white';
								card.innerHTML = `
									<div class="font-medium">${user.name}</div>
									<div class="text-sm text-gray-500">${user.email}</div>
								`;
								resultsEl.appendChild(card);
							});
						}
					},
					onError: (error, url) => {
						console.error(`Error loading JSON from: ${url}`, error.message);
						resultsEl.innerHTML = `<div class="text-red-500">Error loading data: ${error.message}</div>`;
					},
				});
			}
		},

		loadImageExample() {
			if (typeof window.ResourceLoader !== 'undefined') {
				const container = document.getElementById('image-container');
				container.innerHTML = '<div class="text-center text-gray-500">Loading image...</div>';

				// Add a random parameter to avoid caching
				const timestamp = new Date().getTime();
				window.ResourceLoader.include([`https://picsum.photos/400/300?_=${timestamp}`], {
					onSuccess: (url) => {
						// Create and display the image
						container.innerHTML = ''; // Clear previous results

						const img = new Image();
						img.src = url;
						img.alt = 'Dynamically loaded image';
						img.className = 'w-full h-auto rounded shadow-md';
						img.style.maxHeight = '300px';
						img.style.objectFit = 'cover';

						container.appendChild(img);
						console.log('Image loaded successfully.');
					},
					onError: (error, url) => {
						console.error(`Error loading image from: ${url}`, error.message);

						// Show error message
						container.innerHTML = `
							<div class="text-center p-6 bg-red-50 text-red-500 rounded">
								<p>Failed to load image</p>
								<p class="text-sm">${error.message}</p>
							</div>
						`;
					},
				});
			}
		},

		loadImageExampleWithError() {
			if (typeof window.ResourceLoader !== 'undefined') {
				const container = document.getElementById('image-container');
				container.innerHTML = '<div class="text-center text-gray-500">Loading image...</div>';

				// Using a deliberately wrong URL to trigger an error
				window.ResourceLoader.include(['https://picsum.photos/non-existent-path'], {
					onSuccess: (url) => {
						// This should not execute
						container.innerHTML = '<div>Image loaded (unexpected success)</div>';
					},
					onError: (error, url) => {
						console.error(`Error loading image from: ${url}`, error.message);

						// Show error message
						container.innerHTML = `
							<div class="text-center p-6 bg-red-50 text-red-500 rounded">
								<p>Failed to load image</p>
								<p class="text-sm">${error.message}</p>
							</div>
						`;
					},
				});
			}
		},

		loadAudioExample() {
			if (typeof window.ResourceLoader !== 'undefined') {
				const audioContainer = document.getElementById('audio-container');
				audioContainer.innerHTML = '<div class="text-center text-gray-500">Loading audio...</div>';

				window.ResourceLoader.include(['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'], {
					onSuccess: (url) => {
						// For non-binary loading, we get the URL directly
						audioContainer.innerHTML = ''; // Clear previous results

						const audioElement = document.createElement('audio');
						audioElement.controls = true;
						audioElement.src = url;
						audioElement.className = 'w-full';

						const sourceInfo = document.createElement('div');
						sourceInfo.className = 'mt-2 text-sm text-gray-500';
						sourceInfo.textContent = 'Audio from SoundHelix.com (CC-BY)';

						audioContainer.appendChild(audioElement);
						audioContainer.appendChild(sourceInfo);
					},
					onError: (error, url) => {
						console.error(`Error loading audio from: ${url}`, error.message);
						audioContainer.innerHTML = `
							<div class="text-center p-4 bg-red-50 text-red-500 rounded">
								<p>Failed to load audio</p>
								<p class="text-sm">${error.message}</p>
							</div>
						`;
					},
				});
			}
		},

		loadErrorExample() {
			if (typeof window.ResourceLoader !== 'undefined') {
				const errorContainer = document.getElementById('error-container');
				errorContainer.innerHTML = '<div class="text-gray-500">Attempting to load non-existent resource...</div>';

				// Attempt to load from a non-existent URL with retry logic
				window.ResourceLoader.include(['https://non-existent-domain-123456.com/script.js'], {
					// Retry configuration
					retries: 1,
					retryDelay: 1000, // 1 second between retries

					// Timeout setting - shorter for demo purposes
					timeout: 3000, // 3 second timeout

					// Error handling
					onError: (error, url) => {
						console.error(`Error loading: ${url}`);
						console.error(`Error type: ${error.type}`);
						console.error(`Error message: ${error.message}`);

						// Show error to user
						const errorElement = document.createElement('div');
						errorElement.className = 'p-2 border-b border-red-200';

						let errorInfo = `<div class="font-medium">Failed: ${url}</div>`;
						errorInfo += `<div class="text-sm">Error type: ${error.type || 'unknown'}</div>`;
						errorInfo += `<div class="text-sm text-red-500">${error.message}</div>`;

						errorElement.innerHTML = errorInfo;
						errorContainer.innerHTML = '';
						errorContainer.appendChild(errorElement);
					}
				});
			}
		},

		loadResourceStateExample() {
			if (typeof window.ResourceLoader !== 'undefined') {
				const cssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
				document.getElementById('state-message').textContent = 'Loading resource...';

				window.ResourceLoader.include([cssUrl])
					.then(() => {
						document.getElementById('state-display').textContent = 'loaded';
						document.getElementById('state-message').textContent = 'Resource loaded successfully!';
					});
			}
		},

		unloadResourceExample() {
			if (typeof window.ResourceLoader !== 'undefined') {
				const cssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
				window.ResourceLoader.unloadResource(cssUrl);
				document.getElementById('state-display').textContent = 'unloaded';
				document.getElementById('state-message').textContent = 'Resource has been unloaded from the page.';
			}
		},

		checkResourceStateExample() {
			if (typeof window.ResourceLoader !== 'undefined') {
				const cssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
				const state = window.ResourceLoader.getResourceState(cssUrl);
				document.getElementById('state-display').textContent = state;
				document.getElementById('state-message').textContent = `Current state checked at ${new Date().toLocaleTimeString()}`;
			}
		},

		loadLocalResources() {
			if (typeof window.ResourceLoader !== 'undefined') {
				// Load local resources (relative to your site)
				window.ResourceLoader.include([
					'/sample-script.js',   // Local JavaScript file
					'/sample-style.css',   // Local CSS file
					'/sample-data.json'    // Local JSON file
				])
					.then(() => {
						// Access the JavaScript functionality
						if (window.ResourceLoaderTest) {
							document.getElementById('script-output').textContent =
								window.ResourceLoaderTest.sayHello();
						}

						// Apply the CSS
						const cssDemo = document.getElementById('css-demo');
						cssDemo.className = 'resource-loader-test';

						// Display the JSON data
						fetch('/sample-data.json')
							.then(response => response.json())
							.then(data => {
								document.getElementById('json-output').textContent =
									JSON.stringify(data, null, 2);
							});
					})
					.catch(error => {
						console.error('Error loading local resources:', error);
						document.getElementById('script-output').textContent = `Error: ${error.message}`;
					});
			}
		},

		loadWithCacheBusting() {
			if (typeof window.ResourceLoader !== 'undefined') {
				// Clear previous results
				document.getElementById('cache-results').innerHTML = '';
				document.getElementById('cache-timestamp').textContent = 'Loading...';

				// Enable cache busting for all supported file types
				window.ResourceLoader.include(['/sample-script.js', '/sample-style.css', '/sample-data.json'], {
					cacheBusting: true,
					cacheBustingQuery: `?_cb=${new Date().getTime()}`,
					cacheBustingTypes: ['js', 'css', 'json'],
					// Only apply cache busting to files from your own domain
					restrictCacheBustingToLocal: true,
					onSuccess: (url) => {
						document.getElementById('cache-results').innerHTML +=
							`<div class="text-green-500">✓ Loaded: ${url}</div>`;

						// Extract the cache busting parameter to show it worked
						if (url.includes('?_cb=')) {
							const timestamp = url.split('?_cb=')[1];
							document.getElementById('cache-timestamp').textContent = timestamp;
						}
					}
				});
			}
		}
	}
}
</script>

<style scoped>
/* Add the animate.css classes we'll need */
.animate__animated {
	animation-duration: 1s;
	animation-fill-mode: both;
}

.animate__bounce {
	animation-name: bounce;
	transform-origin: center bottom;
}

@keyframes bounce {

	from,
	20%,
	53%,
	80%,
	to {
		animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
		transform: translate3d(0, 0, 0);
	}

	40%,
	43% {
		animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
		transform: translate3d(0, -30px, 0);
	}

	70% {
		animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
		transform: translate3d(0, -15px, 0);
	}

	90% {
		transform: translate3d(0, -4px, 0);
	}
}
</style>
