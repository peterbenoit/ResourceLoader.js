<template>
	<div class="not-found min-h-[70vh] flex flex-col items-center justify-center py-16">
		<div class="container mx-auto px-4 text-center">
			<h1 class="text-6xl font-bold mb-6">404</h1>
			<h2 class="text-3xl font-semibold mb-4">Page Not Found</h2>
			<p class="text-lg mb-8 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
			<router-link to="/"
				class="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors">
				Return to Home
			</router-link>
		</div>
	</div>
</template>

<script>
export default {
	name: 'NotFound'
}
</script>
