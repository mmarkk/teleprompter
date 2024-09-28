<script lang="ts">
	import { onMount } from 'svelte';

	let text = '';
	let file: File | null = null;
	let isPlaying = false;
	let scrollSpeed = 50; // pixels per second
	let containerRef: HTMLDivElement;
	let contentRef: HTMLDivElement;

	$: if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			text = (e.target?.result as string) || '';
		};
		reader.readAsText(file);
	}

	function handlePlay() {
		console.log('Play button clicked');
		isPlaying = true;
		requestAnimationFrame(scroll);
	}

	function handlePause() {
		console.log('Pause button clicked');
		isPlaying = false;
	}

	function handleStop() {
		console.log('Stop button clicked');
		isPlaying = false;
		if (containerRef) {
			containerRef.scrollTop = 0;
		}
	}

	function handleRestart() {
		console.log('Restart button clicked');
		if (containerRef) {
			containerRef.scrollTop = 0;
		}
		isPlaying = true;
		requestAnimationFrame(scroll);
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		file = target.files ? target.files[0] : null;
	}

	let lastTime: number | null = null;
	function scroll(time: number) {
		if (isPlaying && containerRef && contentRef) {
			if (lastTime !== null) {
				const deltaTime = time - lastTime;
				containerRef.scrollTop += (scrollSpeed * deltaTime) / 1000;

				// Check if we've reached the bottom
				if (containerRef.scrollTop + containerRef.clientHeight >= contentRef.clientHeight) {
					console.log('Reached the bottom, stopping playback');
					isPlaying = false;
					return;
				}
			}
			lastTime = time;
			requestAnimationFrame(scroll);
		} else {
			lastTime = null;
		}
	}

	onMount(() => {
		console.log('Component mounted');
	});
</script>

<div class="max-w-2xl mx-auto p-4">
	<div class="mb-4">
		<textarea
			bind:value={text}
			placeholder="Enter your text here or upload a file"
			class="w-full h-32 p-2 border rounded"
		></textarea>
	</div>
	<div class="mb-4">
		<input type="file" accept=".txt" on:change={handleFileChange} class="mb-2" />
	</div>
	<div class="mb-4">
		<label for="speed" class="block mb-2">Scroll Speed:</label>
		<input
			type="range"
			id="speed"
			bind:value={scrollSpeed}
			min="10"
			max="100"
			step="5"
			class="w-full"
		/>
	</div>
	<div class="flex space-x-4 mb-4">
		<button on:click={handlePlay} class="p-2 rounded-full hover:bg-gray-200">
			<img src="/play.svg" alt="Play" class="w-8 h-8" />
		</button>
		<button on:click={handlePause} class="p-2 rounded-full hover:bg-gray-200">
			<img src="/pause.svg" alt="Pause" class="w-8 h-8" />
		</button>
		<button on:click={handleStop} class="p-2 rounded-full hover:bg-gray-200">
			<img src="/stop.svg" alt="Stop" class="w-8 h-8" />
		</button>
		<button on:click={handleRestart} class="p-2 rounded-full hover:bg-gray-200">
			<img src="/restart.svg" alt="Restart" class="w-8 h-8" />
		</button>
	</div>
	<div class="mb-2">
		Status: <span class={isPlaying ? 'text-green-500 font-bold' : 'text-red-500'}
			>{isPlaying ? 'Playing' : 'Stopped'}</span
		>
	</div>
	<div bind:this={containerRef} class="h-64 overflow-y-hidden border rounded p-4 bg-gray-100">
		<div bind:this={contentRef} class="text-3xl leading-relaxed">
			{text}
		</div>
	</div>
</div>
