/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: {
					light: '#3B82F6',
					dark: '#60A5FA'
				},
				background: {
					light: '#F3F4F6',
					dark: '#1F2937'
				},
				text: {
					light: '#1F2937',
					dark: '#F9FAFB'
				}
			}
		}
	},
	plugins: [forms]
};
