<script>
	import { Heart, ArrowLeft, ArrowRight } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import MovieCard from '$lib/components/card/MovieCard.svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';

	let { data } = $props();

	let isAddedToHome = $state(false);

	let user = data?.user;
	let movie_data = data.movieData;
	let movie_id = $page.params.movie_id;
	let recommendation_data = data.recommendation_data;

	let playerEvent = $state(null);
	let recommendationsScrollRef = $state();

	// --- String Interpolation Fixes ---
	// Ensure movie_id is treated as a string and trimmed
	const safeMovieId = String(movie_id).trim();

	let iframeSources = $state([
		`https://vidsrc.icu/embed/movie/${safeMovieId}`,
		`https://vidsrc.to/embed/movie/${safeMovieId}`,
		`https://vidsrc.cc/v2/embed/movie/${safeMovieId}?autoPlay=true`,
		`https://player.videasy.net/movie/${safeMovieId}`,
		`https://player.autoembed.cc/embed/movie/${safeMovieId}`,
		`https://111movies.com/movie/${safeMovieId}`,
		`https://vidjoy.pro/embed/movie/${safeMovieId}`,
		`https://mappletv.uk/watch/movie/${safeMovieId}`,
		`https://embed.rgshows.me/api/3/movie/?id=${safeMovieId}`,
		`https://vidfast.pro/movie/${safeMovieId}?autoPlay=true`,
		`https://embed.rgshows.me/api/2/movie/?id=${safeMovieId}`
	]);

	let selectedSource = $state(0);

	function changeSource(index) {
		selectedSource = index;
	}

	function scrollLeft(ref) {
		ref.scrollBy({ left: -400, behavior: 'smooth' });
	}

	function scrollRight(ref) {
		ref.scrollBy({ left: 400, behavior: 'smooth' });
	}

	const HOME_STORAGE_KEY = 'homepage_movies';

	async function fetchMovieWatchlistStatus() {
		if (!user) return;
		try {
			const response = await fetch(`/api/movie/watchlist/get`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: user.id, tmdb_id: safeMovieId }) // Use safeMovieId
			});

			if (!response.ok) {
				if (response.status === 404) {
					isAddedToHome = false;
					return;
				}
				throw new Error(`Failed to fetch movie watchlist status: ${response.statusText}`);
			}

			const data = await response.json();
			isAddedToHome = !!data?.id;
		} catch (error) {
			console.error('Error fetching movie watchlist status:', error);
			isAddedToHome = false;
		}
	}

	async function toggleHomeStatus() {
		if (!user) return;
		try {
			const postData = {
				user_id: user.id,
				tmdb_id: movie_data.id,
				title: movie_data.title,
				poster_path: movie_data.poster_path,
				average_ratings: movie_data.vote_average
			};

			// Determine action based on current state
			const action = isAddedToHome ? 'remove' : 'add';
			let fetchOptions = {
				method: action === 'add' ? 'POST' : 'POST', // Use DELETE endpoint
				headers: { 'Content-Type': 'application/json' }
			};

			// Include data in body for POST, or potentially in body/params for DELETE (adjust API call as needed)
			if (action === 'add') {
				fetchOptions.body = JSON.stringify(postData);
			} else if (action === 'remove') {
				// Example: Send IDs in body for DELETE
				fetchOptions.body = JSON.stringify({ user_id: user.id, tmdb_id: movie_data.id });
			}

			const response = await fetch('/api/movie/watchlist/save', fetchOptions);

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.message || `Failed to ${action} from watchlist`);
			}

			if (action === 'add') {
				const storedMovies = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
				const moviesData = {
					id: movie_data.id,
					name: movie_data.title,
					poster_path: movie_data.poster_path,
					first_air_date: movie_data.release_date,
					vote_average: movie_data.vote_average,
					addedAt: new Date().toISOString()
				};
				storedMovies.push(moviesData);
				localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(storedMovies));
				toast.success('Added to the list');
				isAddedToHome = true;
			} else {
				const storedMovies = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
				const updatedMovies = storedMovies.filter((movie) => movie.id !== movie_data.id);
				localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(updatedMovies));
				toast.success('Removed from the list');
				isAddedToHome = false;
			}
		} catch (error) {
			console.error(error);
			toast.error('Something went wrong');
		}
	}

	onMount(() => {
		if (user) {
			fetchMovieWatchlistStatus();
		}
	});
</script>

<div class="flex flex-col min-h-screen text-white bg-black overflow-hidden">
	<!-- Single Screen Layout -->
	<div class="flex flex-1 p-4 md:p-6 gap-6 min-h-0">
		<!-- Left Side - Movie Poster and Details -->
		<div class="flex-shrink-0 w-80">
			<!-- Movie Title -->
			<div class="mb-4">
				<h1 class="text-xl md:text-2xl font-bold text-white leading-tight">
					{movie_data.title || movie_data.original_title}
				</h1>
				<p class="text-gray-400 text-sm">{movie_data.release_date}</p>
			</div>

			<!-- Movie Poster -->
			<div class="mb-6">
				<img
					src={`https://image.tmdb.org/t/p/w500${movie_data.poster_path}`}
					alt={`${movie_data.title} Poster`}
					class="w-full rounded-lg shadow-lg border border-gray-700"
				/>
			</div>

			<!-- Add to Home Button -->
			{#if user}
				<button
					class="w-full flex items-center justify-center gap-2 p-3 mb-4 transition-colors duration-200 bg-black border border-gray-700 rounded-lg hover:bg-gray-800"
					onclick={toggleHomeStatus}
					title={isAddedToHome ? 'Remove from Home' : 'Add to Home'}
				>
					<Heart
						size={20}
						color={isAddedToHome ? '#fb2c36' : 'white'}
						fill={isAddedToHome ? '#fb2c36' : 'none'}
					/>
					<span class="text-sm">{isAddedToHome ? 'Added to Home' : 'Add to Home'}</span>
				</button>
			{/if}

			<!-- Movie Overview -->
			<div class="bg-gray-900 rounded-lg p-4 mb-4">
				<h3 class="text-lg font-semibold mb-2">Overview</h3>
				<p class="text-gray-300 text-sm leading-relaxed line-clamp-6">{movie_data.overview}</p>
			</div>

			<!-- Genres -->
			<div class="bg-gray-900 rounded-lg p-4">
				<h4 class="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">Genres</h4>
				<div class="flex flex-wrap gap-2">
					{#each movie_data.genres as genre}
						<span
							class="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded-full text-gray-300"
						>
							{genre.name}
						</span>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right Side - Video Player -->
		<div class="flex-1 flex flex-col min-h-0">
			<!-- Video Player Container -->
			<div class="flex-1 relative bg-gray-900 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden">
				<iframe
					src={iframeSources[selectedSource]}
					class="w-full h-full"
					allowfullscreen
					loading="lazy"
					title="Movie Player"
					scrolling="no"
				></iframe>
			</div>

			<!-- Server Selection Controls -->
			<div class="mt-4 p-4 bg-gray-900 rounded-lg flex-shrink-0">
				<div class="flex items-center gap-2 flex-wrap">
					<span class="text-sm font-medium text-gray-400 mr-2">Server:</span>
					{#each iframeSources as source, index}
						<button
							class={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
								index === selectedSource
									? 'bg-white text-black'
									: 'bg-gray-700 text-white hover:bg-gray-600'
							}`}
							onclick={() => changeSource(index)}
						>
							{index + 1}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-6 {
		display: -webkit-box;
		-webkit-line-clamp: 6;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>