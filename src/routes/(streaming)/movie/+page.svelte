<script>
	import { error } from '@sveltejs/kit';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	import MovieCard from '$lib/components/card/MovieCard.svelte';
	import SeriesCard from '$lib/components/card/SeriesCard.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let { data } = $props();


	let user = data?.user;

	let popularMovies = data.popularMoviesData;
	let newReleases = data.newReleasesData;
	let mySeriesWatchlist = $state([]);
	let myMoiveWatchlist = $state([]);

	async function loadMovieWatchlist(user_id) {
		try {
			const response = await fetch(`/api/movie/watchlist/list`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ user_id: user.id })
			});

			if (!response.ok) {
				throw new Error(`Failed to load movie watchlist: ${response.statusText}`);
			}

			const data = await response.json();

			// Sort the movies based on when they were added
			const sortedMovies = data.records.items.sort(
				(a, b) => new Date(b.created) - new Date(a.created)
			);
			myMoiveWatchlist = sortedMovies;

			// Store the fetched data in local storage
			localStorage.setItem('homepage_movies', JSON.stringify(sortedMovies));
		} catch (error) {
			console.error('Error loading movie watchlist:', error);

			// Fallback: Load from local storage if API fails
			try {
				const storedMovies = JSON.parse(localStorage.getItem('homepage_movies') || '[]');
				myMoiveWatchlist = storedMovies.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
			} catch (localError) {
				console.error('Error loading movies from local storage:', localError);
				myMoiveWatchlist = [];
			}
		}
	}

	onMount(() => {
		if (user) {
			// loadSeriesWatchlist();
			loadMovieWatchlist();
		}
	});
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<!-- My Watchlist Section -->
	<section class="container p-4 mx-auto mt-6 rounded-lg" in:fade>
		{#if myMoiveWatchlist.length > 0}
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold md:text-2xl">My Movies Watchlist</h2>
				<span class="text-sm text-gray-400">{myMoiveWatchlist.length} items</span>
			</div>
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				{#each myMoiveWatchlist as movie}
					<MovieCard
						id={movie.tmdb_id}
						title={movie.title}
						name={movie.title}
						poster_path={movie.poster_path}
						first_air_date={movie.first_air_date}
						vote_average={movie.average_ratings}
					/>
				{/each}
			</div>
		{/if}
	</section>

	<!-- New Releases Section -->
	<section class="container p-4 mx-auto mt-6 rounded-lg">
		{#if newReleases}
			<h2 class="text-xl font-bold md:text-2xl">New Releases</h2>
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				{#each newReleases.results as movie}
					<MovieCard {...movie} />
				{/each}
			</div>
		{/if}
	</section>

	<!-- Popular Movies Section -->
	<section class="container p-4 mx-auto mt-6 rounded-lg">
		{#if popularMovies}
			<h2 class="text-xl font-bold md:text-2xl">Popular Movies</h2>
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
			>
				{#each popularMovies.results as movie}
					<MovieCard {...movie} />
				{/each}
			</div>
		{/if}
	</section>
</div>
