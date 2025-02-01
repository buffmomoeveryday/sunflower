<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { onMount } from 'svelte';
	import SeriesCard from '$lib/components/SeriesCard.svelte';
	let { data } = $props();
	let trendingSeries = data.trendingSeries;
	let topRatedSeries = data.topRatedSeries;
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<section class="container p-4 mx-auto mt-6 rounded-lg">
		{#if trendingSeries}
			<h2 class="text-xl font-bold md:text-2xl">Trending Series</h2>
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
			>
				{#each trendingSeries.results as series}
					<SeriesCard {...series} />
				{/each}
			</div>
		{/if}
	</section>

	<section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if topRatedSeries}
			<h2 class="text-xl font-bold md:text-2xl">Top Rated</h2>
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				{#each topRatedSeries.results as movie}
					<SeriesCard {...movie} />
				{/each}
			</div>
		{/if}
	</section>
</div>
