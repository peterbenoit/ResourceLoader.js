import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

// Import routes
import Home from './views/Home.vue'
import Features from './views/Features.vue'
import Examples from './views/Examples.vue'
import Api from './views/Api.vue'
import NotFound from './views/NotFound.vue'

// Create the router
const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home
		},
		{
			path: '/features',
			name: 'features',
			component: Features
		},
		{
			path: '/examples',
			name: 'examples',
			component: Examples
		},
		{
			path: '/api',
			name: 'api',
			component: Api
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'not-found',
			component: NotFound
		}
	],
	scrollBehavior(to, from, savedPosition) {
		if (to.hash) {
			return { el: to.hash, behavior: 'smooth' }
		} else if (savedPosition) {
			return savedPosition
		} else {
			return { top: 0 }
		}
	}
})

// Create and mount the app
createApp(App).use(router).mount('#app')
