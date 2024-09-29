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
			lastTimestamp = null;
			animationFrameId = requestAnimationFrame(updateScroll);
		} else if (!isPlaying && animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	function togglePlayPause() {
		isPlaying = !isPlaying;
	}

	function handlePlay() {
		isPlaying = true;
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

			if (containerRef.scrollTop + containerRef.clientHeight >= contentRef.clientHeight) {
				isPlaying = false;
			} else {
				lastTimestamp = timestamp;
				animationFrameId = requestAnimationFrame(updateScroll);
			}
		} else {
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

<div class="p-4 space-y-4 sm:p-6 sm:space-y-6">
	<div class="relative">
		<textarea
			bind:value={text}
			bind:this={textareaRef}
			placeholder="Enter your text here or upload a file"
			class="input h-40 w-full"
		></textarea>
		<div class="absolute bottom-3 right-3">
			<label for="file-upload" class="btn btn-primary cursor-pointer text-sm sm:text-base">
				<img
					src="/upload.svg"
					alt="Upload"
					class="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2"
				/>
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

	<div class="flex flex-wrap justify-center gap-2 sm:gap-4">
		<button
			on:click={() => skipTime(-7)}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 sm:p-3"
			title="Rewind 7 seconds"
		>
			<img src="/backward.svg" alt="Rewind" class="w-6 h-6 sm:w-8 sm:h-8 dark:invert" />
		</button>
		<button
			on:click={togglePlayPause}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 sm:p-3"
			title={isPlaying ? 'Pause' : 'Play'}
		>
			<img
				src={isPlaying ? '/pause.svg' : '/play.svg'}
				alt={isPlaying ? 'Pause' : 'Play'}
				class="w-6 h-6 sm:w-8 sm:h-8 dark:invert"
			/>
		</button>
		<button
			on:click={handleStop}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 sm:p-3"
			title="Stop"
		>
			<img src="/stop.svg" alt="Stop" class="w-6 h-6 sm:w-8 sm:h-8 dark:invert" />
		</button>
		<button
			on:click={handleRestart}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 sm:p-3"
			title="Restart"
		>
			<img src="/restart.svg" alt="Restart" class="w-6 h-6 sm:w-8 sm:h-8 dark:invert" />
		</button>
		<button
			on:click={() => skipTime(7)}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 sm:p-3"
			title="Fast Forward 7 seconds"
		>
			<img src="/forward.svg" alt="Fast Forward" class="w-6 h-6 sm:w-8 sm:h-8 dark:invert" />
		</button>
		<button
			on:click={toggleFullscreen}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 sm:p-3"
			title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
		>
			<img src="/fullscreen.svg" alt="Fullscreen" class="w-6 h-6 sm:w-8 sm:h-8 dark:invert" />
		</button>
		<button
			on:click={handleClear}
			class="btn bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 sm:p-3"
			title="Clear Text"
		>
			<img src="/clear.svg" alt="Clear" class="w-6 h-6 sm:w-8 sm:h-8 dark:invert" />
		</button>
	</div>

	<div class="flex justify-center items-center space-x-2">
		<div class="text-sm font-medium">Status:</div>
		<div class="relative w-8 h-8">
			<svg
				class="w-8 h-8 {isPlaying
					? 'text-green-500'
					: 'text-red-500'} transition-colors duration-300"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle cx="10" cy="10" r="8" />
			</svg>
			<div class="absolute inset-0 flex items-center justify-center">
				{#if isPlaying}
					<svg
						class="w-4 h-4 text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M5 4v12l10-6z" />
					</svg>
				{:else}
					<svg
						class="w-4 h-4 text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path fill-rule="evenodd" d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" clip-rule="evenodd" />
					</svg>
				{/if}
			</div>
		</div>
		<div class="text-sm font-medium">{isPlaying ? 'Playing' : 'Stopped'}</div>
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
					<div class="flex flex-wrap justify-center gap-2 sm:gap-4">
						<button
							on:click={() => skipTime(-7)}
							class="btn bg-white hover:bg-gray-200 p-2 sm:p-3"
							title="Rewind 7 seconds"
						>
							<img src="/backward.svg" alt="Rewind" class="w-6 h-6 sm:w-8 sm:h-8" />
						</button>
						<button
							on:click={togglePlayPause}
							class="btn bg-white hover:bg-gray-200 p-2 sm:p-3"
							title={isPlaying ? 'Pause' : 'Play'}
						>
							<img
								src={isPlaying ? '/pause.svg' : '/play.svg'}
								alt={isPlaying ? 'Pause' : 'Play'}
								class="w-6 h-6 sm:w-8 sm:h-8"
							/>
						</button>
						<button
							on:click={handleStop}
							class="btn bg-white hover:bg-gray-200 p-2 sm:p-3"
							title="Stop"
						>
							<img src="/stop.svg" alt="Stop" class="w-6 h-6 sm:w-8 sm:h-8" />
						</button>
						<button
							on:click={handleRestart}
							class="btn bg-white hover:bg-gray-200 p-2 sm:p-3"
							title="Restart"
						>
							<img src="/restart.svg" alt="Restart" class="w-6 h-6 sm:w-8 sm:h-8" />
						</button>
						<button
							on:click={() => skipTime(7)}
							class="btn bg-white hover:bg-gray-200 p-2 sm:p-3"
							title="Fast Forward 7 seconds"
						>
							<img src="/forward.svg" alt="Fast Forward" class="w-6 h-6 sm:w-8 sm:h-8" />
						</button>
						<button
							on:click={toggleFullscreen}
							class="btn bg-white hover:bg-gray-200 p-2 sm:p-3"
							title="Exit Fullscreen"
						>
							<img src="/fullscreen.svg" alt="Fullscreen" class="w-6 h-6 sm:w-8 sm:h-8" />
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

	@media (max-width: 360px) {
		.btn {
			padding: 0.5rem;
		}
		.btn img {
			width: 1.25rem;
			height: 1.25rem;
		}
	}
</style>
