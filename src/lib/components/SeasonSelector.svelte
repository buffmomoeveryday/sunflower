<script>
	import { ChevronDownIcon } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	let { currentSeason, totalSeasons, onSeasonChange } = $props();

	let isOpen = $state(false);

	const toggleDropdown = () => {
		isOpen = !isOpen;
	};

	const selectSeason = (season) => {
		onSeasonChange(season);
		isOpen = false;
	};
</script>

<div class="relative">
	<button
		onclick={toggleDropdown}
		class="flex items-center gap-2 px-4 py-2 border rounded-lg bg-card hover:bg-card/80"
	>
		<span>Season {currentSeason}</span>
		<ChevronDownIcon class="size-4" />
	</button>

	{#if isOpen}
		<div transition:slide class="absolute w-48 mt-2 border rounded-lg shadow-lg bg-card">
			{#each Array(totalSeasons) as _, i}
				<button
					onclick={() => selectSeason(i + 1)}
					class="w-full px-4 py-2 text-left hover:bg-muted"
				>
					Season {i + 1}
				</button>
			{/each}
		</div>
	{/if}
</div>
