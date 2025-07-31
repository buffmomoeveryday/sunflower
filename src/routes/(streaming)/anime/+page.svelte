<script>
	import AnimeCard from '$lib/components/card/AnimeCard.svelte';
	import { onMount } from 'svelte';
	let { data } = $props();
	let japTitle = $state(false);
	let animes = data.animeData;
</script>

<div class="min-h-screen p-4 text-white bg-black">
	{#await data.animeData}
		Loading...
	{:then animes}
		<section class="container p-4 mx-auto mt-8 rounded-lg">
			<div class="flex flex-col items-start justify-between gap-2 mb-4 sm:flex-row sm:items-center">
				<h2 class="text-xl font-bold md:text-2xl">Trending Anime</h2>
				<label class="inline-flex items-center gap-2 text-sm font-medium text-gray-300">
					<input
						type="checkbox"
						bind:checked={japTitle}
						class="w-4 h-4 text-blue-600 rounded bg-gray-700 border-gray-600 focus:ring-blue-500"
					/>
					Show Japanese Title
				</label>
			</div>

			<div
				class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				{#each animes as anime}
					<AnimeCard
						id={anime.id}
						name={japTitle ? anime.title.romaji : anime.title.english}
						vote={anime.averageScore}
						poster={anime.coverImage.large}
						startDate={anime.startDate.year}
						episodes={anime.episodes}
					/>
				{/each}
			</div>
		</section>
	{:catch error}
		<section class="container p-4 mx-auto mt-8 rounded">
			<div class="flex flex-col items-center justify-center gap-2">
				Some Error Occoured While Loading please refresh
			</div>
		</section>
	{/await}
</div>
