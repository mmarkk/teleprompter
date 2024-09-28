<script lang="ts">
	import Teleprompter from '$lib/Teleprompter.svelte';
</script>

<main class="container mx-auto p-4">
	<h1 class="text-3xl font-bold mb-4">Teleprompter App</h1>
	<Teleprompter />
</main>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.gray.100);
	}
</style>
