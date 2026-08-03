<script>
	import SeriesCard from "$lib/components/card/SeriesCard.svelte";
	import { onMount } from "svelte";
	import { getBookmarkedSeries } from "$lib/remote/bookmarks.remote.js";

	let { data } = $props();

	let user = data?.user;
	let mySeriesWatchlist = $state([]);

	let popularAnime = data.popularAnime;
	let topRatedAnime = data.topRatedAnime;
	let recentAnime = data.recentAnime;

	async function loadSeriesWatchlist() {
		try {
			mySeriesWatchlist = await getBookmarkedSeries();
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

<p class="mx-auto max-w-6xl px-4 pt-2 text-xs text-gray-500 sm:px-6">
	TMDB has no separate “anime” type; this list uses discover TV (Animation + Japanese). Cards open
	<a class="text-pink-400 underline hover:text-pink-300" href="/series">Series</a>
	playback. Older AniList-based anime detail URLs still work under <span class="text-gray-600">/anime/[id]</span>.
</p>

{#snippet layout(series, titleName)}
	<section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if series && series.results}
			<section class="container p-4 mx-auto mt-6 rounded-lg">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold md:text-2xl">{titleName}</h2>
					<span class="text-sm text-gray-400">{series.results?.length || 0} items</span>
				</div>
				<div class="mt-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-4">
					<div
						class="flex sm:grid flex-nowrap sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
					>
						{#each series.results as s}
							<div class="flex-none w-[170px] sm:w-auto">
								<SeriesCard
									tmdb_id={s.id}
									title={s.title}
									name={s.name}
									poster_path={s.poster_path}
									first_air_date={s.first_air_date}
									vote_average={s.vote_average}
									number_of_seasons={s.number_of_seasons ?? 1}
									genre_ids={s.genre_ids ?? []}
								/>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</section>
{/snippet}

{@render layout(popularAnime, "Popular Anime")}
{@render layout(topRatedAnime, "Top Rated Anime")}
{@render layout(recentAnime, "Recently Added")}

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
