<script>
	import Navbar from "$lib/components/Navbar.svelte";
	import MovieCard from "$lib/components/card/MovieCard.svelte";
	import SeriesCard from "$lib/components/card/SeriesCard.svelte";
	import { onMount } from "svelte";

	let { data } = $props();

	let user = data?.user;
	let mySeriesWatchlist = $state([]);

	let trendingSeries = $state(data.trendingSeries);
	let topRatedSeries = $state(data.topRatedSeries);
	let popularSeries = $state(data.popularSeries);

	let airingTodaySeriesScrollRef = $state();
	let topRatedSeriesScrollRef = $state();
	let popularSeriesScrollRef = $state();

	async function loadSeriesWatchlist() {
		try {
			const response = await fetch(`/api/series/watchlist/list`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
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
			localStorage.setItem("homepage_series", JSON.stringify(sortedSeries));
		} catch (error) {
			console.error("Error loading series watchlist:", error);
			mySeriesWatchlist = [];
		}
	}

	onMount(() => {
		if (user) {
			loadSeriesWatchlist();
		}
	});
</script>

{#snippet layout(series, titleName)}
	<section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if series.results}
			<section class="container p-4 mx-auto mt-6 rounded-lg">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold md:text-2xl">{titleName}</h2>
					<span class="text-sm text-gray-400">{series.results.length} items</span>
				</div>
				<div class="mt-4 overflow-x-auto scrollbar-hide">
					<div
						class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
					>
						{#each series.results as s}
							<SeriesCard
								tmdb_id={s.id}
								title={s.title}
								name={s.name}
								poster_path={s.poster_path}
								first_air_date={s.first_air_date}
								vote_average={s.vote_average}
							/>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</section>
{/snippet}

{@render layout(trendingSeries, "Trending Series")}
{@render layout(topRatedSeries, "Top Rated Series")}
{@render layout(popularSeries, "Popular Series")}

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
