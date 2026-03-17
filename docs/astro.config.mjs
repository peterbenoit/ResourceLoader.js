import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'ResourceLoader.js',
			description: 'A lightweight, zero-dependency JavaScript library for dynamically loading any resource type in the browser.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/peterbenoit/ResourceLoader.js' },
			],
			components: {
				Footer: './src/components/Footer.astro',
			},
			customCss: [
				// Load custom styles if available
				'./src/styles/custom.css',
			],
			head: [
				{
					tag: 'script',
					attrs: {
						src: '/resourceLoader.js',
						defer: true,
					}
				},
				{
					tag: 'meta',
					attrs: {
						name: 'author',
						content: 'Peter Benoit',
					}
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:creator',
						content: '@peterbenoit',
					}
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:type',
						content: 'website',
					}
				}
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Installation', link: '/getting-started/installation/' },
						{ label: 'Quick Start', link: '/getting-started/quick-start/' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Loading Scripts & CSS', link: '/guides/loading-scripts-and-css/' },
						{ label: 'Loading JSON', link: '/guides/loading-json/' },
						{ label: 'Loading Media & Files', link: '/guides/loading-media-and-files/' },
						{ label: 'Concurrency & Priority', link: '/guides/concurrency-and-priority/' },
						{ label: 'Retries & Timeouts', link: '/guides/retries-and-timeouts/' },
						{ label: 'Cache Busting', link: '/guides/cache-busting/' },
						{ label: 'Error Handling', link: '/guides/error-handling/' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'include()', link: '/api/include/' },
						{ label: 'cancelResource()', link: '/api/cancel-resource/' },
						{ label: 'cancelAll()', link: '/api/cancel-all/' },
						{ label: 'unloadResource()', link: '/api/unload-resource/' },
						{ label: 'getResourceState()', link: '/api/get-resource-state/' },
						{ label: 'setLoggingLevel()', link: '/api/set-logging-level/' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Options Object', link: '/reference/options/' },
						{ label: 'Supported Types', link: '/reference/supported-types/' },
						{ label: 'Error Types', link: '/reference/error-types/' },
						{ label: 'Changelog', link: '/reference/changelog/' },
						{ label: 'Contributing', link: '/reference/contributing/' },
					],
				},
			],
		}),
	],
});
