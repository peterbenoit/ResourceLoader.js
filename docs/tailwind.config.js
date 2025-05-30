/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{vue,js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				primary: '#3490dc',
				secondary: '#ffed4a',
				accent: '#f56565',
			},
		},
	},
	plugins: [],
}
