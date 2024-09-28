<script lang="ts">
	import { onMount } from 'svelte';

	let text = '';
	let file: File | null = null;
	let isPlaying = false;
	let scrollSpeed = 50; // pixels per second
	let containerRef: HTMLDivElement;
	let contentRef: HTMLDivElement;
	let textareaRef: HTMLTextAreaElement;

	$: if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			text = (e.target?.result as string) || '';
		};
		reader.readAsText(file);
	}

	function togglePlayPause() {
		if (isPlaying) {
			handlePause();
		} else {
			handlePlay();
		}
	}

	function handlePlay() {
		isPlaying = true;
		requestAnimationFrame(scroll);
	}

	function handlePause() {
		isPlaying = false;
	}

	function handleStop() {
		isPlaying = false;
		if (containerRef) {
			containerRef.scrollTop = 0;
		}
	}

	function handleRestart() {
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

				if (containerRef.scrollTop + containerRef.clientHeight >= contentRef.clientHeight) {
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

	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'Space' && document.activeElement !== textareaRef) {
			event.preventDefault();
			togglePlayPause();
		}
	}

	function skipTime(seconds: number) {
		if (containerRef && contentRef) {
			const pixelsToSkip = scrollSpeed * seconds;
			containerRef.scrollTop += pixelsToSkip;

			if (containerRef.scrollTop + containerRef.clientHeight >= contentRef.clientHeight) {
				isPlaying = false;
				containerRef.scrollTop = contentRef.clientHeight - containerRef.clientHeight;
			} else if (containerRef.scrollTop < 0) {
				containerRef.scrollTop = 0;
			}
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="p-6 space-y-6">
	<div class="relative">
		<textarea
			bind:value={text}
			bind:this={textareaRef}
			placeholder="Enter your text here or upload a file"
			class="input h-40"
		></textarea>
		<div class="absolute bottom-3 right-3">
			<label for="file-upload" class="btn btn-primary cursor-pointer">
				<img src="/upload.svg" alt="Upload" class="w-5 h-5 inline-block mr-2" />
				Upload File
			</label>
			<input
				id="file-upload"
				type="file"
				accept=".txt"
				on:change={handleFileChange}
				class="hidden"
			/>
		</div>
	</div>

	<div>
		<label for="speed" class="block mb-2 text-sm font-medium">Scroll Speed: {scrollSpeed}</label>
		<input
			type="range"
			id="speed"
			bind:value={scrollSpeed}
			min="10"
			max="100"
			step="5"
			class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
		/>
	</div>

	<div class="flex justify-center space-x-4">
		<button
			on:click={() => skipTime(-7)}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			aria-label="Rewind"
		>
			<img src="/backward.svg" alt="Rewind" class="w-8 h-8 dark:invert" />
		</button>
		<button
			on:click={togglePlayPause}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			aria-label={isPlaying ? 'Pause' : 'Play'}
		>
			<img
				src={isPlaying ? '/pause.svg' : '/play.svg'}
				alt={isPlaying ? 'Pause' : 'Play'}
				class="w-8 h-8 dark:invert"
			/>
		</button>
		<button
			on:click={handleStop}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			aria-label="Stop"
		>
			<img src="/stop.svg" alt="Stop" class="w-8 h-8 dark:invert" />
		</button>
		<button
			on:click={handleRestart}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			aria-label="Restart"
		>
			<img src="/restart.svg" alt="Restart" class="w-8 h-8 dark:invert" />
		</button>
		<button
			on:click={() => skipTime(7)}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			aria-label="Fast Forward"
		>
			<img src="/forward.svg" alt="Fast Forward" class="w-8 h-8 dark:invert" />
		</button>
	</div>

	<div class="text-center font-medium">
		Status: <span class={isPlaying ? 'text-green-500' : 'text-red-500'}
			>{isPlaying ? 'Playing' : 'Stopped'}</span
		>
	</div>

	<div
		bind:this={containerRef}
		class="h-64 overflow-y-hidden border rounded-lg p-4 bg-gray-100 dark:bg-gray-800 shadow-inner"
	>
		<div bind:this={contentRef} class="text-3xl leading-relaxed">
			{text}
		</div>
	</div>
</div>

<style>
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: theme('colors.primary.light');
		cursor: pointer;
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: theme('colors.primary.light');
		cursor: pointer;
	}

	:global(.dark) input[type='range']::-webkit-slider-thumb {
		background: theme('colors.primary.dark');
	}

	:global(.dark) input[type='range']::-moz-range-thumb {
		background: theme('colors.primary.dark');
	}
</style>
