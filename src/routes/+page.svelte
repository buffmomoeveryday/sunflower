<script>
	import { error } from "@sveltejs/kit";
	import { fade } from "svelte/transition";
	import { onMount } from "svelte";

	import MovieCard from "$lib/components/card/MovieCard.svelte";
	import SeriesCard from "$lib/components/card/SeriesCard.svelte";
	import Navbar from "$lib/components/Navbar.svelte";

	let { data } = $props();

	let user = data?.user;

	let popularMovies = data.popularMoviesData;
	let newReleases = data.newReleasesData;
	let trendingMovies = data.trendingMoviesData;

	let mySeriesWatchlist = $state([]);
	let myMoiveWatchlist = $state([]);

	let isBrave = $state(true);

	async function loadMovieWatchlist(user_id) {
		try {
			const response = await fetch(`/api/movie/watchlist/list`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ user_id: user.id })
			});

			if (!response.ok) {
				throw new Error(`Failed to load movie watchlist: ${response.statusText}`);
			}

			const data = await response.json();

			const sortedMovies = data.records.items.sort(
				(a, b) => new Date(b.created) - new Date(a.created)
			);
			myMoiveWatchlist = sortedMovies;

			localStorage.setItem("homepage_movies", JSON.stringify(sortedMovies));
		} catch (error) {
			console.error("Error loading movie watchlist:", error);

			try {
				const storedMovies = JSON.parse(localStorage.getItem("homepage_movies") || "[]");
				myMoiveWatchlist = storedMovies.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
			} catch (localError) {
				console.error("Error loading movies from local storage:", localError);
				myMoiveWatchlist = [];
			}
		}
	}

	function checkIfBrave() {
		if (window.navigator.brave != undefined && window.navigator.brave.isBrave.name == "isBrave") {
			isBrave = true;
		} else {
			isBrave = false;
		}
	}

	onMount(() => {
		checkIfBrave();
		if (user) {
			loadMovieWatchlist();
		}
	});
</script>

{#snippet layout(movies_series, titleName)}
	<section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if movies_series.results}
			<section class="container p-4 mx-auto mt-6 rounded-lg">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold md:text-2xl">{titleName}</h2>
					<span class="text-sm text-gray-400">{movies_series.results.length} items</span>
				</div>
				<div class="mt-4 overflow-x-auto scrollbar-hide">
					<div
						class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
					>
						{#each movies_series.results as m}
							{#if m.media_type == "tv"}
								<SeriesCard
									tmdb_id={m.id}
									poster_path={m.poster_path}
									name={m.name}
									vote_average={m.vote_average}
									first_air_date={m.first_air_date}
									number_of_seasons={m.number_of_seasons}
								/>
							{:else}
								<MovieCard {...m} />
							{/if}
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</section>
{/snippet}

{@render layout(trendingMovies, "Trending")}
{@render layout(newReleases, "New Releases")}
{@render layout(popularMovies, "Popular Movies")}
