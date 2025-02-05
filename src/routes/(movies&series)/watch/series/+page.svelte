<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { onMount } from 'svelte';
	import SeriesCard from '$lib/components/SeriesCard.svelte';

	let { data } = $props();

	let user = data?.user;
	let mySeriesWatchlist = $state([]);
	let trendingSeries = data.trendingSeries;
	let topRatedSeries = data.topRatedSeries;

	async function loadSeriesWatchlist(user_id) {
		try {
			const response = await fetch(`/api/series/watchlist/list`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ user_id: user.id })
			});

			if (!response.ok) {
				throw new Error(`Failed to load series watchlist: ${response.statusText}`);
			}
			const data = await response.json();
			const sortedSeries = data.records.items.sort(
				(a, b) => new Date(b.created) - new Date(a.created)
			);
			mySeriesWatchlist = sortedSeries;
			localStorage.setItem('homepage_series', JSON.stringify(sortedSeries));
		} catch (error) {
			console.error('Error loading series watchlist:', error);
			mySeriesWatchlist = [];
		}
	}

	onMount(() => {
		if (user) {
			loadSeriesWatchlist();
		}
	});
</script>

<div class="min-h-screen p-4 text-white bg-black">
	{#if mySeriesWatchlist.length > 0}
		<section class="container p-4 mx-auto mt-6 rounded-lg">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold md:text-2xl">My Series Watchlist</h2>
				<span class="text-sm text-gray-400">{mySeriesWatchlist.length} items</span>
			</div>
			<div class="mt-4 overflow-x-auto scrollbar-hide">
				<div
					class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
				>
					{#each mySeriesWatchlist as series}
						<SeriesCard
							id={series.tmdb_id}
							title={series.title}
							name={series.title}
							poster_path={series.poster_path}
							first_air_date={series.first_air_date}
							vote_average={series.average_ratings}
							media_type="tv"
						/>
					{/each}
				</div>
			</div>
		</section>
	{/if}

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

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
