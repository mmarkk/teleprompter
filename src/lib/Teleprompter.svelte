<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let text = '';
	let file: File | null = null;
	let isPlaying = false;
	let scrollSpeed = 60; // Default speed set to 55
	let containerRef: HTMLDivElement;
	let contentRef: HTMLDivElement;
	let textareaRef: HTMLTextAreaElement;
	let isFullscreen = false;
	let fullscreenControlsRef: HTMLDivElement;
	let animationFrameId: number | null = null;
	let lastTimestamp: number | null = null;

	$: if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			text = (e.target?.result as string) || '';
		};
		reader.readAsText(file);
	}

	$: if (browser) {
		if (isPlaying && !animationFrameId) {
			// console.log('Starting scroll animation');
			lastTimestamp = null;
			animationFrameId = requestAnimationFrame(updateScroll);
		} else if (!isPlaying && animationFrameId) {
			// console.log('Stopping scroll animation');
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	function togglePlayPause() {
		isPlaying = !isPlaying;
		// console.log('Toggle Play/Pause:', isPlaying);
	}

	function handlePlay() {
		isPlaying = true;
		// console.log('Handle Play');
	}

	function handlePause() {
		isPlaying = false;
		// console.log('Handle Pause');
	}

	function handleStop() {
		isPlaying = false;
		if (containerRef) {
			containerRef.scrollTop = 0;
		}
		// console.log('Handle Stop');
	}

	function handleRestart() {
		if (containerRef) {
			containerRef.scrollTop = 0;
		}
		isPlaying = true;
		// console.log('Handle Restart');
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		file = target.files ? target.files[0] : null;
	}

	function handleClear() {
		text = '';
		file = null;
		handleStop();
	}

	function updateScroll(timestamp: number) {
		if (containerRef && contentRef) {
			if (lastTimestamp === null) {
				lastTimestamp = timestamp;
			}
			const deltaTime = timestamp - lastTimestamp;
			const scrollAmount = (scrollSpeed / 1000) * deltaTime;
			containerRef.scrollTop += scrollAmount;
			// console.log('Scrolling:', scrollAmount, 'Current position:', containerRef.scrollTop);

			if (containerRef.scrollTop + containerRef.clientHeight >= contentRef.clientHeight) {
				// console.log('Reached end of content');
				isPlaying = false;
			} else {
				lastTimestamp = timestamp;
				animationFrameId = requestAnimationFrame(updateScroll);
			}
		} else {
			// console.log('Container or content ref not available');
			animationFrameId = requestAnimationFrame(updateScroll);
		}
	}

	function skipTime(seconds: number) {
		if (containerRef && contentRef) {
			const pixelsToSkip = (scrollSpeed / 1000) * seconds * 1000; // Convert seconds to milliseconds
			containerRef.scrollTop += pixelsToSkip;

			if (containerRef.scrollTop + containerRef.clientHeight >= contentRef.clientHeight) {
				isPlaying = false;
				containerRef.scrollTop = contentRef.clientHeight - containerRef.clientHeight;
			} else if (containerRef.scrollTop < 0) {
				containerRef.scrollTop = 0;
			}
		}
	}

	function toggleFullscreen() {
		if (browser) {
			if (!document.fullscreenElement) {
				containerRef.requestFullscreen().catch((err) => {
					console.error(`Error attempting to enable fullscreen: ${err.message}`);
				});
			} else {
				document.exitFullscreen();
			}
		}
	}

	function showFullscreenControls() {
		if (fullscreenControlsRef) {
			fullscreenControlsRef.style.opacity = '1';
			fullscreenControlsRef.style.transform = 'translateY(0)';
		}
	}

	function hideFullscreenControls() {
		if (fullscreenControlsRef) {
			fullscreenControlsRef.style.opacity = '0';
			fullscreenControlsRef.style.transform = 'translateY(100%)';
		}
	}

	onMount(() => {
		// console.log('Component mounted');
		if (browser) {
			const handleFullscreenChange = () => {
				isFullscreen = !!document.fullscreenElement;
				if (isFullscreen) {
					showFullscreenControls();
					setTimeout(hideFullscreenControls, 3000);
				}
			};

			document.addEventListener('fullscreenchange', handleFullscreenChange);

			return () => {
				document.removeEventListener('fullscreenchange', handleFullscreenChange);
				if (animationFrameId !== null) {
					cancelAnimationFrame(animationFrameId);
				}
			};
		}
	});
</script>

<div class="p-6 space-y-6">
	<div class="relative">
		<textarea
			bind:value={text}
			bind:this={textareaRef}
			placeholder="Enter your text here or upload a file"
			class="input h-40 w-full"
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
			title="Rewind 7 seconds"
		>
			<img src="/backward.svg" alt="Rewind" class="w-8 h-8 dark:invert" />
		</button>
		<button
			on:click={togglePlayPause}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			title={isPlaying ? 'Pause' : 'Play'}
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
			title="Stop"
		>
			<img src="/stop.svg" alt="Stop" class="w-8 h-8 dark:invert" />
		</button>
		<button
			on:click={handleRestart}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Restart"
		>
			<img src="/restart.svg" alt="Restart" class="w-8 h-8 dark:invert" />
		</button>
		<button
			on:click={() => skipTime(7)}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Fast Forward 7 seconds"
		>
			<img src="/forward.svg" alt="Fast Forward" class="w-8 h-8 dark:invert" />
		</button>
		<button
			on:click={toggleFullscreen}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
		>
			<img src="/fullscreen.svg" alt="Fullscreen" class="w-8 h-8 dark:invert" />
		</button>
		<button
			on:click={handleClear}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Clear Text"
		>
			<img src="/clear.svg" alt="Clear" class="w-8 h-8 dark:invert" />
		</button>
	</div>

	<div class="text-center font-medium">
		Status: <span class={isPlaying ? 'text-green-500' : 'text-red-500'}
			>{isPlaying ? 'Playing' : 'Stopped'}</span
		>
	</div>

	<div
		bind:this={containerRef}
		class="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-100 dark:bg-gray-800 shadow-inner relative"
		on:mousemove={showFullscreenControls}
		on:mouseleave={hideFullscreenControls}
		role="region"
		aria-label="Teleprompter text container"
	>
		<div
			bind:this={contentRef}
			class="text-3xl leading-relaxed fullscreen-text whitespace-pre-wrap"
		>
			{text}
		</div>
		{#if isFullscreen}
			<div
				bind:this={fullscreenControlsRef}
				class="fullscreen-controls fixed bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 transition-all duration-300 ease-in-out"
			>
				<div class="flex flex-col items-center space-y-4">
					<div class="flex justify-center space-x-4">
						<button
							on:click={() => skipTime(-7)}
							class="btn bg-white hover:bg-gray-200"
							title="Rewind 7 seconds"
						>
							<img src="/backward.svg" alt="Rewind" class="w-8 h-8" />
						</button>
						<button
							on:click={togglePlayPause}
							class="btn bg-white hover:bg-gray-200"
							title={isPlaying ? 'Pause' : 'Play'}
						>
							<img
								src={isPlaying ? '/pause.svg' : '/play.svg'}
								alt={isPlaying ? 'Pause' : 'Play'}
								class="w-8 h-8"
							/>
						</button>
						<button on:click={handleStop} class="btn bg-white hover:bg-gray-200" title="Stop">
							<img src="/stop.svg" alt="Stop" class="w-8 h-8" />
						</button>
						<button on:click={handleRestart} class="btn bg-white hover:bg-gray-200" title="Restart">
							<img src="/restart.svg" alt="Restart" class="w-8 h-8" />
						</button>
						<button
							on:click={() => skipTime(7)}
							class="btn bg-white hover:bg-gray-200"
							title="Fast Forward 7 seconds"
						>
							<img src="/forward.svg" alt="Fast Forward" class="w-8 h-8" />
						</button>
						<button
							on:click={toggleFullscreen}
							class="btn bg-white hover:bg-gray-200"
							title="Exit Fullscreen"
						>
							<img src="/fullscreen.svg" alt="Fullscreen" class="w-8 h-8" />
						</button>
					</div>
					<div class="w-full max-w-md">
						<label for="fullscreen-speed" class="block mb-2 text-sm font-medium text-white"
							>Scroll Speed: {scrollSpeed}</label
						>
						<input
							type="range"
							id="fullscreen-speed"
							bind:value={scrollSpeed}
							min="10"
							max="100"
							step="5"
							class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
						/>
					</div>
				</div>
			</div>
		{/if}
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

	:fullscreen .fullscreen-text {
		font-size: 6rem;
		line-height: 1.2;
	}

	:fullscreen .fullscreen-controls {
		opacity: 0;
		transform: translateY(100%);
	}

	:fullscreen .fullscreen-controls:hover {
		opacity: 1;
		transform: translateY(0);
	}
</style>
