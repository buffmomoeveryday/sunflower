<script>
	import { PlayIcon, PauseIcon, Volume2Icon, VolumeXIcon } from 'lucide-svelte';

	let isPlaying = $state(false);
	let isMuted = $state(false);
	let progress = $state(0);

	const togglePlay = () => {
		isPlaying = !isPlaying;
	};

	const toggleMute = () => {
		isMuted = !isMuted;
	};
</script>

<div class="relative w-full overflow-hidden bg-black aspect-video">
	<!-- Video Placeholder -->
	<img src="$assets/ui-placeholder.png" alt="Video thumbnail" class="object-cover w-full h-full" />
	<!-- Video Controls -->
	<div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
		<div class="flex items-center gap-4">
			<!-- Play/Pause Button -->
			<button onclick={togglePlay} class="p-2 text-black bg-white rounded-full hover:bg-white/90">
				{#if isPlaying}
					<PauseIcon class="size-6" />
				{:else}
					<PlayIcon class="size-6" />
				{/if}
			</button>

			<!-- Progress Bar -->
			<div class="flex-1">
				<input
					type="range"
					min="0"
					max="100"
					bind:value={progress}
					class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
				/>
			</div>

			<!-- Volume Control -->
			<button onclick={toggleMute} class="p-2 text-white rounded-full hover:bg-white/20">
				{#if isMuted}
					<VolumeXIcon class="size-5" />
				{:else}
					<Volume2Icon class="size-5" />
				{/if}
			</button>
		</div>
	</div>
</div>
