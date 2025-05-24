<template>
	<div class="api-reference py-12">
		<div class="container mx-auto px-4">
			<h1 class="text-3xl font-bold mb-12 text-center">API Reference</h1>

			<div class="max-w-4xl mx-auto">
				<!-- Table of Contents -->
				<div class="bg-white shadow-md rounded-lg p-6 mb-8">
					<h3 class="text-xl font-semibold mb-4">Contents</h3>
					<ul class="grid md:grid-cols-2 gap-2">
						<li><a href="#include" class="text-primary hover:underline">include()</a></li>
						<li><a href="#unloadResource" class="text-primary hover:underline">unloadResource()</a></li>
						<li><a href="#cancelResource" class="text-primary hover:underline">cancelResource()</a></li>
						<li><a href="#cancelAll" class="text-primary hover:underline">cancelAll()</a></li>
						<li><a href="#getResourceState" class="text-primary hover:underline">getResourceState()</a></li>
						<li><a href="#setLoggingLevel" class="text-primary hover:underline">setLoggingLevel()</a></li>
						<li><a href="#config-options" class="text-primary hover:underline">Configuration Options</a>
						</li>
					</ul>
				</div>

				<!-- include() -->
				<section id="include" class="mb-12 bg-white shadow-md rounded-lg overflow-hidden">
					<div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
						<h2 class="text-2xl font-bold">include(urls, options)</h2>
					</div>
					<div class="p-6">
						<p class="mb-4">Loads one or more resources dynamically and returns a Promise that resolves when
							all resources have been loaded.</p>

						<h3 class="text-lg font-semibold mt-6 mb-2">Parameters</h3>

						<div class="mb-6">
							<h4 class="font-medium">urls</h4>
							<p class="text-gray-600 mb-1"><em>Array&lt;String&gt; | String</em></p>
							<p>An array of URLs or a single URL to be loaded.</p>
						</div>

						<div>
							<h4 class="font-medium">options</h4>
							<p class="text-gray-600 mb-1"><em>Object (optional)</em></p>
							<p>An object containing configuration options. See <a href="#config-options"
									class="text-primary hover:underline">Configuration Options</a> for details.</p>
						</div>

						<h3 class="text-lg font-semibold mt-6 mb-2">Returns</h3>
						<p><em>Promise</em> - Resolves when all resources are loaded, rejects if any resource fails to
							load.</p>

						<h3 class="text-lg font-semibold mt-6 mb-4">Examples</h3>

						<div class="bg-gray-50 p-4 rounded-md mb-4">
							<pre class="text-sm overflow-x-auto"><code>// Basic usage
ResourceLoader.include('script.js')
  .then(() => {
    console.log('Script loaded');
  });

// Multiple resources with options
ResourceLoader.include(
  ['script1.js', 'script2.js', 'styles.css'],
  {
    cacheBusting: true,
    retries: 2
  }
);</code></pre>
						</div>
					</div>
				</section>

				<!-- unloadResource() -->
				<section id="unloadResource" class="mb-12 bg-white shadow-md rounded-lg overflow-hidden">
					<div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
						<h2 class="text-2xl font-bold">unloadResource(url)</h2>
					</div>
					<div class="p-6">
						<p class="mb-4">Unloads a previously loaded resource from the page by removing its DOM element
							and clearing the cache.</p>

						<h3 class="text-lg font-semibold mt-6 mb-2">Parameters</h3>

						<div class="mb-6">
							<h4 class="font-medium">url</h4>
							<p class="text-gray-600 mb-1"><em>String</em></p>
							<p>The URL of the resource to unload.</p>
						</div>

						<h3 class="text-lg font-semibold mt-6 mb-4">Example</h3>

						<div class="bg-gray-50 p-4 rounded-md mb-4">
							<pre class="text-sm overflow-x-auto"><code>// Unload a script
ResourceLoader.unloadResource('https://example.com/script.js');</code></pre>
						</div>
					</div>
				</section>

				<!-- cancelResource() -->
				<section id="cancelResource" class="mb-12 bg-white shadow-md rounded-lg overflow-hidden">
					<div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
						<h2 class="text-2xl font-bold">cancelResource(url)</h2>
					</div>
					<div class="p-6">
						<p class="mb-4">Cancels the loading of a resource that is currently being loaded.</p>

						<h3 class="text-lg font-semibold mt-6 mb-2">Parameters</h3>

						<div class="mb-6">
							<h4 class="font-medium">url</h4>
							<p class="text-gray-600 mb-1"><em>String</em></p>
							<p>The URL of the resource to cancel.</p>
						</div>

						<h3 class="text-lg font-semibold mt-6 mb-4">Example</h3>

						<div class="bg-gray-50 p-4 rounded-md mb-4">
							<pre class="text-sm overflow-x-auto"><code>// Start loading a large resource
const loadPromise = ResourceLoader.include('https://example.com/large-file.js');

// Later, if needed, cancel the loading
ResourceLoader.cancelResource('https://example.com/large-file.js');</code></pre>
						</div>
					</div>
				</section>

				<!-- cancelAll() -->
				<section id="cancelAll" class="mb-12 bg-white shadow-md rounded-lg overflow-hidden">
					<div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
						<h2 class="text-2xl font-bold">cancelAll()</h2>
					</div>
					<div class="p-6">
						<p class="mb-4">Cancels all pending resource loads.</p>

						<h3 class="text-lg font-semibold mt-6 mb-4">Example</h3>

						<div class="bg-gray-50 p-4 rounded-md mb-4">
							<pre class="text-sm overflow-x-auto"><code>// Cancel all pending loads (useful when navigating away)
ResourceLoader.cancelAll();</code></pre>
						</div>
					</div>
				</section>

				<!-- getResourceState() -->
				<section id="getResourceState" class="mb-12 bg-white shadow-md rounded-lg overflow-hidden">
					<div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
						<h2 class="text-2xl font-bold">getResourceState(url)</h2>
					</div>
					<div class="p-6">
						<p class="mb-4">Gets the current loading state of a resource.</p>

						<h3 class="text-lg font-semibold mt-6 mb-2">Parameters</h3>

						<div class="mb-6">
							<h4 class="font-medium">url</h4>
							<p class="text-gray-600 mb-1"><em>String</em></p>
							<p>The URL of the resource to check.</p>
						</div>

						<h3 class="text-lg font-semibold mt-6 mb-2">Returns</h3>
						<p><em>String</em> - One of the following values:</p>
						<ul class="list-disc pl-6 mb-4">
							<li><code>"loading"</code> - The resource is currently being loaded</li>
							<li><code>"loaded"</code> - The resource has been successfully loaded</li>
							<li><code>"unloaded"</code> - The resource is not loaded or was previously unloaded</li>
						</ul>

						<h3 class="text-lg font-semibold mt-6 mb-4">Example</h3>

						<div class="bg-gray-50 p-4 rounded-md mb-4">
							<pre class="text-sm overflow-x-auto"><code>// Check if jQuery is already loaded
const jqueryUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
const state = ResourceLoader.getResourceState(jqueryUrl);

if (state !== 'loaded') {
  ResourceLoader.include(jqueryUrl)
    .then(() => console.log('jQuery loaded'));
} else {
  console.log('jQuery already loaded');
}</code></pre>
						</div>
					</div>
				</section>

				<!-- setLoggingLevel() -->
				<section id="setLoggingLevel" class="mb-12 bg-white shadow-md rounded-lg overflow-hidden">
					<div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
						<h2 class="text-2xl font-bold">setLoggingLevel(level)</h2>
					</div>
					<div class="p-6">
						<p class="mb-4">Sets the logging level for ResourceLoader operations.</p>

						<h3 class="text-lg font-semibold mt-6 mb-2">Parameters</h3>

						<div class="mb-6">
							<h4 class="font-medium">level</h4>
							<p class="text-gray-600 mb-1"><em>String</em></p>
							<p>The logging level to set. One of:</p>
							<ul class="list-disc pl-6 mb-4">
								<li><code>"silent"</code> - No logs will be shown</li>
								<li><code>"warn"</code> - Only warnings and errors will be shown (default)</li>
								<li><code>"verbose"</code> - All logs including debug information will be shown</li>
							</ul>
						</div>

						<h3 class="text-lg font-semibold mt-6 mb-4">Example</h3>

						<div class="bg-gray-50 p-4 rounded-md mb-4">
							<pre class="text-sm overflow-x-auto"><code>// Set verbose logging during development
ResourceLoader.setLoggingLevel('verbose');

// Or use the option in include() calls
ResourceLoader.include(['script.js'], { logLevel: 'verbose' });</code></pre>
						</div>
					</div>
				</section>

				<!-- Configuration Options -->
				<section id="config-options" class="mb-12 bg-white shadow-md rounded-lg overflow-hidden">
					<div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
						<h2 class="text-2xl font-bold">Configuration Options</h2>
					</div>
					<div class="p-6">
						<p class="mb-4">Options that can be passed to the <code>include()</code> method:</p>

						<table class="w-full border-collapse">
							<thead>
								<tr class="bg-gray-100">
									<th class="p-3 text-left font-semibold">Option</th>
									<th class="p-3 text-left font-semibold">Type</th>
									<th class="p-3 text-left font-semibold">Default</th>
									<th class="p-3 text-left font-semibold">Description</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200">
								<tr>
									<td class="p-3 font-medium"><code>logLevel</code></td>
									<td class="p-3"><code>String</code></td>
									<td class="p-3"><code>'warn'</code></td>
									<td class="p-3">Log level. Can be <code>'silent'</code>, <code>'warn'</code>, or
										<code>'verbose'</code>.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>onSuccess</code></td>
									<td class="p-3"><code>Function</code></td>
									<td class="p-3"><code>null</code></td>
									<td class="p-3">Callback when the resource(s) load successfully.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>onError</code></td>
									<td class="p-3"><code>Function</code></td>
									<td class="p-3"><code>null</code></td>
									<td class="p-3">Callback when a resource fails to load.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>retries</code></td>
									<td class="p-3"><code>Number</code></td>
									<td class="p-3"><code>0</code></td>
									<td class="p-3">Number of times to retry loading on failure.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>retryDelay</code></td>
									<td class="p-3"><code>Number</code></td>
									<td class="p-3"><code>1000</code></td>
									<td class="p-3">Delay in milliseconds between retry attempts.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>timeout</code></td>
									<td class="p-3"><code>Number</code></td>
									<td class="p-3"><code>10000</code></td>
									<td class="p-3">Timeout in milliseconds for loading resources.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>deferScriptsUntilReady</code></td>
									<td class="p-3"><code>Boolean</code></td>
									<td class="p-3"><code>true</code></td>
									<td class="p-3">If true, defers script loading until DOM is ready.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>maxConcurrency</code></td>
									<td class="p-3"><code>Number</code></td>
									<td class="p-3"><code>3</code></td>
									<td class="p-3">Maximum number of concurrent resources to load.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>batchSize</code></td>
									<td class="p-3"><code>Number</code></td>
									<td class="p-3"><code>5</code></td>
									<td class="p-3">Size of batches when loading multiple resources.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>cacheBusting</code></td>
									<td class="p-3"><code>Boolean</code></td>
									<td class="p-3"><code>false</code></td>
									<td class="p-3">Whether to append cache-busting parameters.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>cacheBustingQuery</code></td>
									<td class="p-3"><code>String</code></td>
									<td class="p-3"><code>'?_={timestamp}'</code></td>
									<td class="p-3">Query string to append for cache busting.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>cacheBustingTypes</code></td>
									<td class="p-3"><code>Array</code></td>
									<td class="p-3"><code>['js', 'css']</code></td>
									<td class="p-3">File extensions to apply cache busting to.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>restrictCacheBustingToLocal</code></td>
									<td class="p-3"><code>Boolean</code></td>
									<td class="p-3"><code>true</code></td>
									<td class="p-3">Only apply cache busting to local resources.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>crossorigin</code></td>
									<td class="p-3"><code>String</code></td>
									<td class="p-3"><code>false</code></td>
									<td class="p-3">Sets crossorigin attribute for script/css/image resources.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>attributes</code></td>
									<td class="p-3"><code>Object</code></td>
									<td class="p-3"><code>{}</code></td>
									<td class="p-3">Additional attributes to set on elements (e.g., integrity).</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>appendToBody</code></td>
									<td class="p-3"><code>Boolean</code></td>
									<td class="p-3"><code>false</code></td>
									<td class="p-3">If true, appends script resources to body instead of head.</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>priority</code></td>
									<td class="p-3"><code>Number</code></td>
									<td class="p-3"><code>0</code></td>
									<td class="p-3">Priority for loading (higher values load first).</td>
								</tr>
								<tr>
									<td class="p-3 font-medium"><code>removeFailedElements</code></td>
									<td class="p-3"><code>Boolean</code></td>
									<td class="p-3"><code>true</code></td>
									<td class="p-3">Remove DOM elements of failed resources.</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Api'
}
</script>
