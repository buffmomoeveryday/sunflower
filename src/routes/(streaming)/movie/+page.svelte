<script>
	import { error } from "@sveltejs/kit";
	import { fade } from "svelte/transition";
	import { onMount } from "svelte";
	import MovieCard from "$lib/components/card/MovieCard.svelte";
	import { getBookmarkedMovies } from "$lib/remote/bookmarks.remote.js";

	let { data } = $props();

	let user = data?.user;
	let popularMovies = data.popularMoviesData;
	let newReleases = data.newReleasesData;
	let mySeriesWatchlist = $state([]);
	let myMoiveWatchlist = $state([]);

	async function loadMovieWatchlist() {
		try {
			myMoiveWatchlist = await getBookmarkedMovies();
		} catch (error) {
			console.error("Error loading movie watchlist:", error);
			myMoiveWatchlist = [];
		}
	}

	onMount(() => {
		if (user) {
			loadMovieWatchlist();
		}
	});
</script>

{#snippet layout(movies, titleName)}
	<section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if movies && movies.results}
			<section class="container p-4 mx-auto mt-6 rounded-lg">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold md:text-2xl">{titleName}</h2>
					<span class="text-sm text-gray-400">{movies.results?.length || 0} items</span>
				</div>
				<div class="mt-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-4">
					<div
						class="flex sm:grid flex-nowrap sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
					>
						{#each movies.results as m}
							<div class="flex-none w-[170px] sm:w-auto">
								<MovieCard {...m} />
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</section>
{/snippet}

{@render layout(newReleases, "New Releases")}
{@render layout(popularMovies, "Popular Movies")}

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
