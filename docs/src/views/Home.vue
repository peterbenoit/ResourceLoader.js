<template>
	<div class="home">
		<!-- Hero Section -->
		<section class="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
			<div class="container mx-auto px-4">
				<div class="grid md:grid-cols-2 gap-12 items-center">
					<div>
						<h1 class="text-4xl md:text-5xl font-bold mb-4">ResourceLoader.js</h1>
						<p class="text-xl mb-8">A flexible JavaScript library for dynamically loading resources like
							JavaScript, CSS, images, JSON, and more.</p>
						<div class="flex flex-wrap gap-4">
							<a href="#get-started"
								class="btn bg-white text-primary hover:bg-gray-100 font-medium px-6 py-2 rounded-md">Get
								Started</a>
							<a href="https://github.com/peterbenoit/ResourceLoader.js" target="_blank"
								class="btn bg-transparent border border-white hover:bg-white/10 px-6 py-2 rounded-md">View
								on GitHub</a>
						</div>
					</div>
					<div class="hidden md:block">
						<div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
							<pre class="text-sm overflow-x-auto"><code>// Load multiple resources
ResourceLoader.include([
  'script.js',
  'styles.css',
  'data.json'
], {
  logLevel: 'verbose',
  cacheBusting: true
}).then(() => {
  console.log('All resources loaded!');
});</code></pre>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Overview -->
		<section class="py-16 bg-white" id="get-started">
			<div class="container mx-auto px-4">
				<h2 class="text-3xl font-bold text-center mb-12">Why Use ResourceLoader.js?</h2>
				<div class="grid md:grid-cols-3 gap-8">
					<div class="p-6 bg-gray-50 rounded-lg shadow-md">
						<div class="text-primary text-3xl mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24"
								stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Dynamic Resource Loading</h3>
						<p>Load JS, CSS, images, JSON, fonts, and more on demand without blocking page rendering.</p>
					</div>

					<div class="p-6 bg-gray-50 rounded-lg shadow-md">
						<div class="text-primary text-3xl mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24"
								stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Error Handling</h3>
						<p>Intelligent error handling with retries, timeouts, and detailed error messages to help debug
							issues.</p>
					</div>

					<div class="p-6 bg-gray-50 rounded-lg shadow-md">
						<div class="text-primary text-3xl mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24"
								stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Security Features</h3>
						<p>Built-in support for crossorigin and integrity attributes for secure resource loading.</p>
					</div>
				</div>

				<div class="mt-12 grid md:grid-cols-3 gap-8">
					<div class="p-6 bg-gray-50 rounded-lg shadow-md">
						<div class="text-primary text-3xl mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24"
								stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Performance Optimization</h3>
						<p>Control concurrency, defer script loading, and manage loading priorities to optimize page
							performance.</p>
					</div>

					<div class="p-6 bg-gray-50 rounded-lg shadow-md">
						<div class="text-primary text-3xl mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24"
								stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Cache Control</h3>
						<p>Built-in cache busting options to ensure your users always get the latest version of your
							resources.</p>
					</div>

					<div class="p-6 bg-gray-50 rounded-lg shadow-md">
						<div class="text-primary text-3xl mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24"
								stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Versatile API</h3>
						<p>Clean, promise-based API with rich options for managing resource loading in your
							applications.</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Quick Start -->
		<section class="py-16 bg-gray-50">
			<div class="container mx-auto px-4">
				<h2 class="text-3xl font-bold mb-8 text-center">Quick Start</h2>
				<div class="max-w-3xl mx-auto">
					<div class="mb-8">
						<h3 class="text-xl font-semibold mb-4">1. Include the library</h3>
						<div class="bg-white p-4 rounded-md shadow-md">
							<pre
								class="text-sm overflow-x-auto"><code>&lt;script src="path/to/ResourceLoader.js"&gt;&lt;/script&gt;</code></pre>
						</div>
					</div>
					<div class="mb-8">
						<h3 class="text-xl font-semibold mb-4">2. Load resources</h3>
						<div class="bg-white p-4 rounded-md shadow-md">
							<pre class="text-sm overflow-x-auto"><code>ResourceLoader.include([
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css'
])
.then(() => {
  console.log('Resources loaded successfully.');
})
.catch((error) => {
  console.error('Error loading resources:', error);
});</code></pre>
						</div>
					</div>
					<div class="text-center">
						<router-link to="/examples" class="btn btn-primary inline-block">View More
							Examples</router-link>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
export default {
	name: 'Home'
}
</script>
