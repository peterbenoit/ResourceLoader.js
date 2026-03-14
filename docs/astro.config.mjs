import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'ResourceLoader.js',
      description:
        'A lightweight, zero-dependency JavaScript library for dynamically loading any resource type in the browser.',
      logo: {
        alt: 'ResourceLoader.js',
        src: './src/assets/logo.svg',
      },
      social: {
        github: 'https://github.com/peterbenoit/ResourceLoader.js',
      },
      editLink: {
        baseUrl:
          'https://github.com/peterbenoit/ResourceLoader.js/edit/main/docs/',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'index' },
            {
              label: 'Installation',
              slug: 'getting-started/installation',
            },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
          ],
        },
        {
          label: 'Guides',
          items: [
            {
              label: 'Loading Scripts & CSS',
              slug: 'guides/loading-scripts-and-css',
            },
            { label: 'Loading Data (JSON)', slug: 'guides/loading-json' },
            {
              label: 'Loading Media & Files',
              slug: 'guides/loading-media-and-files',
            },
            { label: 'Error Handling', slug: 'guides/error-handling' },
            {
              label: 'Retries & Timeouts',
              slug: 'guides/retries-and-timeouts',
            },
            { label: 'Cache Busting', slug: 'guides/cache-busting' },
            {
              label: 'Concurrency & Priority',
              slug: 'guides/concurrency-and-priority',
            },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'include()', slug: 'api/include' },
            {
              label: 'unloadResource()',
              slug: 'api/unload-resource',
            },
            {
              label: 'cancelResource()',
              slug: 'api/cancel-resource',
            },
            { label: 'cancelAll()', slug: 'api/cancel-all' },
            {
              label: 'getResourceState()',
              slug: 'api/get-resource-state',
            },
            {
              label: 'setLoggingLevel()',
              slug: 'api/set-logging-level',
            },
          ],
        },
        {
          label: 'Reference',
          items: [
            {
              label: 'Options Reference',
              slug: 'reference/options',
            },
            {
              label: 'Supported File Types',
              slug: 'reference/supported-types',
            },
            { label: 'Error Types', slug: 'reference/error-types' },
            { label: 'Changelog', slug: 'reference/changelog' },
            { label: 'Contributing', slug: 'reference/contributing' },
          ],
        },
      ],
    }),
  ],
});
