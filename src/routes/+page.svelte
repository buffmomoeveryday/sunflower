<script>
	import { error } from '@sveltejs/kit';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import SeriesCard from '$lib/components/SeriesCard.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	import { onMount } from 'svelte';

	let { data } = $props();

	let user = data.user;

	let popularMovies = data.popularMoviesData;
	let newReleases = data.newReleasesData;
	let mySeriesWatchlist = $state([]);
	let myMoiveWatchlist = $state([]);

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
		loadSeriesWatchlist();
		loadMovieWatchlist();
	});
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<div class="container p-6 mx-auto mt-6 space-y-6 rounded-lg shadow-lg bg-gray-50">
		<!-- Viewing Experience Section -->
		<div class="flex items-start p-4 space-x-4 border rounded-lg">
			<div class="flex-1 text-blue-900">
				<h2 class="text-xl font-semibold">For the best viewing experience without ads:</h2>
				<ul class="mt-3 ml-5 space-y-2 list-disc">
					<li>
						On mobile devices, we recommend using
						<a
							href="https://play.google.com/store/apps/details?id=com.brave.browser&hl=en&pli=1"
							target="_blank"
							class="font-medium text-blue-600 hover:underline">Brave Browser Android</a
						>
						or
						<a
							href="https://apps.apple.com/us/app/brave-browser-search-engine/id1052879175"
							target="_blank"
							class="font-medium text-blue-600 hover:underline">Brave Browser iOS</a
						>.
					</li>
					<li>
						Please install the uBlock Origin extension for
						<a
							href="https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm?hl=en&pli=1"
							target="_blank"
							class="font-bold text-blue-600 hover:underline">Chrome</a
						>
						or
						<a
							href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
							target="_blank"
							class="font-bold text-blue-600 hover:underline">Firefox</a
						>.
					</li>
				</ul>
			</div>
		</div>

		{#if !user}
			<!-- Account Sync Section -->
			<div class="flex items-start p-4 space-x-4 border border-blue-300 rounded-lg bg-blue-50">
				<div class="flex-1 text-blue-900">
					<h2 class="text-xl font-semibold">Sync Your Episodes and Series:</h2>
					<p class="mt-2">
						You don't need an account to watch. However, if you have one, you can sync your episodes
						and watched series across devices. Please note that syncing watch time is not supported
						due to limitations with embedding streams.
					</p>
				</div>
			</div>
		{/if}
	</div>

	{#await mySeriesWatchlist}
		<p>waiting for the promise to resolve...</p>
	{:then mySeriesWatchlist}
		{#if mySeriesWatchlist.length > 0}
			<section class="container p-4 mx-auto mt-6 rounded-lg">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-bold md:text-2xl">My Series Watchlist</h2>
					<span class="text-sm text-gray-400">{mySeriesWatchlist.length} items</span>
				</div>
				<div
					class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
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
			</section>
		{/if}
	{:catch error}
		<p>Something went wrong: {error.message}</p>
	{/await}

	<!-- My Watchlist Section -->
	{#if myMoiveWatchlist.length > 0}
		<section class="container p-4 mx-auto mt-6 rounded-lg">
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
		</section>
	{/if}

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

	<!-- New Releases Section -->
	<section class="container p-4 mx-auto mt-8 rounded-lg">
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
</div>
