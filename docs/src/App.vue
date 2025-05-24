<template>
	<div class="app-container min-h-screen flex flex-col">
		<header class="bg-white shadow-md">
			<nav class="container mx-auto px-4 py-3 flex items-center justify-between">
				<div class="flex items-center">
					<router-link to="/" class="text-2xl font-bold text-primary">
						ResourceLoader.js
					</router-link>
				</div>
				<div class="hidden md:flex space-x-8">
					<router-link to="/" class="font-medium hover:text-primary transition-colors">Home</router-link>
					<router-link to="/features"
						class="font-medium hover:text-primary transition-colors">Features</router-link>
					<router-link to="/examples"
						class="font-medium hover:text-primary transition-colors">Examples</router-link>
					<router-link to="/api" class="font-medium hover:text-primary transition-colors">API</router-link>
				</div>
				<div class="md:hidden">
					<button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-500">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
							stroke="currentColor">
							<path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16" />
							<path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</nav>
			<!-- Mobile menu, show/hide based on menu state -->
			<div v-if="mobileMenuOpen" class="md:hidden">
				<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
					<router-link to="/"
						class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-primary">Home</router-link>
					<router-link to="/features"
						class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-primary">Features</router-link>
					<router-link to="/examples"
						class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-primary">Examples</router-link>
					<router-link to="/api"
						class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 hover:text-primary">API</router-link>
				</div>
			</div>
		</header>

		<main class="flex-grow">
			<router-view v-slot="{ Component }">
				<transition name="fade" mode="out-in">
					<component :is="Component" />
				</transition>
			</router-view>
		</main>

		<footer class="bg-gray-800 text-white py-8">
			<div class="container mx-auto px-4">
				<div class="grid md:grid-cols-2 gap-8">
					<div>
						<h3 class="text-xl font-bold mb-4">ResourceLoader.js</h3>
						<p>A flexible JavaScript library for dynamically loading resources like JavaScript, CSS, images,
							JSON, and other file types.</p>
					</div>
					<div class="md:text-right">
						<h4 class="text-lg font-bold mb-2">Links</h4>
						<ul class="space-y-1">
							<li><a href="https://github.com/peterbenoit/ResourceLoader.js" class="hover:text-primary"
									target="_blank">GitHub Repository</a></li>
							<li><a href="https://codepen.io/peterbenoit/pen/gOVLWXZ" class="hover:text-primary"
									target="_blank">CodePen Demo</a></li>
						</ul>
					</div>
				</div>
				<div class="mt-8 pt-4 border-t border-gray-700 text-center">
					<p>© {{ new Date().getFullYear() }} ResourceLoader.js | Released under the MIT License.</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
export default {
	data() {
		return {
			mobileMenuOpen: false
		};
	},
	watch: {
		$route() {
			// Close mobile menu when route changes
			this.mobileMenuOpen = false;
		}
	}
};
</script>

<style>
/* Fade transition for page changes */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
