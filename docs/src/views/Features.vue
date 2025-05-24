<template>
	<div class="features py-12">
		<div class="container mx-auto px-4">
			<h1 class="text-3xl font-bold mb-12 text-center">Features</h1>

			<div class="space-y-16">
				<!-- Feature 1: Dynamic Resource Loading -->
				<section id="dynamic-loading" class="bg-white rounded-xl shadow-md overflow-hidden">
					<div class="grid md:grid-cols-2">
						<div class="p-8">
							<h2 class="text-2xl font-bold text-primary mb-4">Dynamic Resource Loading</h2>
							<p class="mb-4">Load various resource types on demand without blocking the page rendering:
							</p>
							<ul class="list-disc pl-5 space-y-2 mb-6">
								<li>JavaScript files</li>
								<li>CSS stylesheets</li>
								<li>JSON data</li>
								<li>Images (JPG, PNG, GIF, SVG)</li>
								<li>Fonts (WOFF, WOFF2)</li>
								<li>Binary files (PDF, ZIP)</li>
								<li>Audio and video files</li>
							</ul>
							<p>Resources are loaded asynchronously by default, improving page performance.</p>
						</div>
						<div class="bg-gray-50 p-8 flex items-center">
							<div class="w-full">
								<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"><code>// Load multiple resource types
ResourceLoader.include([
  'script.js',           // JS file
  'styles.css',          // CSS file
  'data.json',           // JSON data
  'image.png',           // Image
  'fonts/custom.woff2',  // Font
  'document.pdf'         // PDF file
]);</code></pre>
							</div>
						</div>
					</div>
				</section>

				<!-- Feature 2: Concurrency Control -->
				<section id="concurrency" class="bg-white rounded-xl shadow-md overflow-hidden">
					<div class="grid md:grid-cols-2">
						<div class="p-8 md:order-2">
							<h2 class="text-2xl font-bold text-primary mb-4">Concurrency Control</h2>
							<p class="mb-4">Prevent overwhelming the browser and network with too many simultaneous
								requests:</p>
							<ul class="list-disc pl-5 space-y-2 mb-6">
								<li>Set maximum concurrent downloads</li>
								<li>Prioritize critical resources</li>
								<li>Batch requests intelligently</li>
								<li>Improved performance on slower connections</li>
							</ul>
							<p>Optimizing concurrency can significantly improve load times, especially on mobile
								devices.</p>
						</div>
						<div class="bg-gray-50 p-8 flex items-center md:order-1">
							<div class="w-full">
								<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"><code>// Limit to 3 concurrent requests
ResourceLoader.include([
  'resource1.js',
  'resource2.css',
  'resource3.json',
  'resource4.js',
  'resource5.css'
], {
  maxConcurrency: 3
});</code></pre>
							</div>
						</div>
					</div>
				</section>

				<!-- Feature 3: Retries and Error Handling -->
				<section id="error-handling" class="bg-white rounded-xl shadow-md overflow-hidden">
					<div class="grid md:grid-cols-2">
						<div class="p-8">
							<h2 class="text-2xl font-bold text-primary mb-4">Retries and Error Handling</h2>
							<p class="mb-4">Robust error handling capabilities:</p>
							<ul class="list-disc pl-5 space-y-2 mb-6">
								<li>Automatic retry of failed resources</li>
								<li>Customizable retry counts and delays</li>
								<li>Detailed error categorization</li>
								<li>Callbacks for success and failure events</li>
								<li>Error reporting with resource URLs</li>
							</ul>
							<p>Ensure your application remains functional even when resource loading encounters network
								issues.</p>
						</div>
						<div class="bg-gray-50 p-8 flex items-center">
							<div class="w-full">
								<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"><code>// Configure retries for unreliable resources
ResourceLoader.include(['https://example.com/api.js'], {
  retries: 3,
  retryDelay: 1000, // 1 second
  onError: (error, url) => {
    console.error(`Failed to load ${url}: ${error.message}`);
  }
});</code></pre>
							</div>
						</div>
					</div>
				</section>

				<!-- Feature 4: Cache Busting -->
				<section id="cache-busting" class="bg-white rounded-xl shadow-md overflow-hidden">
					<div class="grid md:grid-cols-2">
						<div class="p-8 md:order-2">
							<h2 class="text-2xl font-bold text-primary mb-4">Cache Busting</h2>
							<p class="mb-4">Ensure users always get the latest version of your resources:</p>
							<ul class="list-disc pl-5 space-y-2 mb-6">
								<li>Append timestamps or random values to URLs</li>
								<li>Selectively apply to specific file types</li>
								<li>Option to restrict to local resources only</li>
								<li>Customizable query parameter format</li>
							</ul>
							<p>Perfect for development environments or when you need to force reload of updated
								resources.</p>
						</div>
						<div class="bg-gray-50 p-8 flex items-center md:order-1">
							<div class="w-full">
								<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"><code>// Enable cache busting for JS and CSS files
ResourceLoader.include(['app.js', 'styles.css'], {
  cacheBusting: true,
  cacheBustingTypes: ['js', 'css'],
  cacheBustingQuery: `?v=${new Date().getTime()}`
});</code></pre>
							</div>
						</div>
					</div>
				</section>

				<!-- Feature 5: Security Features -->
				<section id="security" class="bg-white rounded-xl shadow-md overflow-hidden">
					<div class="grid md:grid-cols-2">
						<div class="p-8">
							<h2 class="text-2xl font-bold text-primary mb-4">Cross-Origin and Integrity Handling</h2>
							<p class="mb-4">Enhanced security for resource loading:</p>
							<ul class="list-disc pl-5 space-y-2 mb-6">
								<li>Support for crossorigin attributes</li>
								<li>Integrity check validation</li>
								<li>Custom attribute handling</li>
								<li>Security validation warnings</li>
							</ul>
							<p>Follow best practices for security when loading third-party resources.</p>
						</div>
						<div class="bg-gray-50 p-8 flex items-center">
							<div class="w-full">
								<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"><code>// Load script with integrity and crossorigin
ResourceLoader.include(['https://cdn.example.com/lib.js'], {
  crossorigin: 'anonymous',
  attributes: {
    integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9...'
  }
});</code></pre>
							</div>
						</div>
					</div>
				</section>

				<!-- Feature 6: Blob and File Loading -->
				<section id="blob-loading" class="bg-white rounded-xl shadow-md overflow-hidden">
					<div class="grid md:grid-cols-2">
						<div class="p-8 md:order-2">
							<h2 class="text-2xl font-bold text-primary mb-4">Blob and File Loading</h2>
							<p class="mb-4">Handle binary files with ease:</p>
							<ul class="list-disc pl-5 space-y-2 mb-6">
								<li>Load images as blobs</li>
								<li>Load audio and video files</li>
								<li>Manage PDF and other document formats</li>
								<li>Process binary data</li>
							</ul>
							<p>Create object URLs for dynamic content loading without the need for static hosting.</p>
						</div>
						<div class="bg-gray-50 p-8 flex items-center md:order-1">
							<div class="w-full">
								<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto"><code>// Load and display an audio file
ResourceLoader.include(['audio.mp3'], {
  onSuccess: (data) => {
    const blobUrl = URL.createObjectURL(data);
    const audioEl = document.createElement('audio');
    audioEl.src = blobUrl;
    audioEl.controls = true;
    document.body.appendChild(audioEl);
  }
});</code></pre>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Features'
}
</script>
