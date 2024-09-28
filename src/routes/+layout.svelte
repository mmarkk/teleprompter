<script>
	import '../app.css';
	import { onMount } from 'svelte';

	let darkMode = true;

	function toggleDarkMode() {
		darkMode = !darkMode;
		if (darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	onMount(() => {
		darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (darkMode) {
			document.documentElement.classList.add('dark');
		}
	});
</script>

<div
	class="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300"
>
	<nav class="p-4 flex justify-between items-center">
		<h1 class="text-2xl font-bold">Teleprompter App</h1>
		<button
			on:click={toggleDarkMode}
			class="p-2 rounded-full bg-primary-light dark:bg-primary-dark text-white hover:bg-opacity-80 transition-colors duration-300"
			aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<img
				src={darkMode ? '/light.svg' : '/dark.svg'}
				alt={darkMode ? 'Light mode' : 'Dark mode'}
				class="w-6 h-6 dark:invert"
			/>
		</button>
	</nav>
	<main class="container mx-auto p-4">
		<slot />
	</main>
</div>
