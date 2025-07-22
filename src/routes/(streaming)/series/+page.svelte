<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import MovieCard from '$lib/components/card/MovieCard.svelte';
	import SeriesCard from '$lib/components/card/SeriesCard.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	let user = data?.user;
	let mySeriesWatchlist = $state([]);

	let trendingSeries = data.trendingSeries;
	let topRatedSeries = data.topRatedSeries;
	let popularSeries = data.popularSeries
	
	let airingTodaySeriesScrollRef =$state();
	let topRatedSeriesScrollRef=$state();
	let popularSeriesScrollRef=$state();

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

	function scrollLeft(ref) {
		ref.scrollBy({ left: -400, behavior: 'smooth' });
	}

	function scrollRight(ref) {
		ref.scrollBy({ left: 400, behavior: 'smooth' });
	}

	onMount(() => {
		if (user) {
			loadSeriesWatchlist();
		}
	});

	import {ArrowRight,ArrowLeft} from 'lucide-svelte'


</script>

<div class="min-h-screen p-4 text-white bg-black">
	
	<!-- My Watchlist Section -->
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

	<!-- Trending Section -->
	<section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if trendingSeries}
			<h2 class="text-xl font-bold md:text-2xl mb-2">Popular Series </h2>

			<div class="relative">
				<!-- Scroll Buttons -->
				<button
					class="absolute z-10 left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
					onclick={() => scrollLeft(airingTodaySeriesScrollRef)}
				>
					<ArrowLeft/>
				</button>
				<button
					class="absolute z-10 right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
					onclick={() => scrollRight(airingTodaySeriesScrollRef)}
				>
					<ArrowRight/>
				</button>

				<div
					bind:this={airingTodaySeriesScrollRef}
					class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8 py-2"
				>

					{#each popularSeries.results as series}
						<div class="flex-shrink-0 w-[160px]">
							<SeriesCard {...series} />
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if topRatedSeries}
			<h2 class="text-xl font-bold md:text-2xl mb-2">Top Rated Series</h2>

			<div class="relative">
				<!-- Scroll Buttons -->
				<button
					class="absolute z-10 left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
					onclick={() => scrollLeft(topRatedSeriesScrollRef)}
				>
					<ArrowLeft/>
				</button>
				<button
					class="absolute z-10 right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
					onclick={() => scrollRight(topRatedSeriesScrollRef)}
				>
					<ArrowRight/>
				</button>

				<div
					bind:this={topRatedSeriesScrollRef}
					class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8 py-2"
				>

					{#each topRatedSeries.results as series}
						<div class="flex-shrink-0 w-[160px]">
							<SeriesCard {...series} />
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if popularSeries}
			
			<h2 class="text-xl font-bold md:text-2xl mb-2">Trending</h2>
			<div class="relative">
				<!-- Scroll Buttons -->
				<button
					class="absolute z-10 left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
					onclick={() => scrollLeft(popularSeriesScrollRef)}
				>
					<ArrowLeft/>
				</button>
				<button
					class="absolute z-10 right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
					onclick={() => scrollRight(popularSeriesScrollRef)}
				>
					<ArrowRight/>
				</button>

				<div
					bind:this={popularSeriesScrollRef}
					class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8 py-2"
				>

					{#each topRatedSeries.results as series}
						<div class="flex-shrink-0 w-[160px]">
							<SeriesCard {...series} />
						</div>
					{/each}
				</div>
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
