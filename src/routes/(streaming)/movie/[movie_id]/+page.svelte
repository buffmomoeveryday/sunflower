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

<div class="flex flex-col min-h-screen text-white bg-black">
	<!-- Video Player Section - Maintains 16:9 Aspect Ratio -->
	<section class="flex-1 flex flex-col p-4 md:p-6 min-h-0">
		<!-- Title -->
		<div class="mb-4 flex-shrink-0">
			<h1 class="text-xl md:text-2xl font-bold text-white">
				{movie_data.title || movie_data.original_title}
			</h1>
			<p class="text-gray-400 text-sm">{movie_data.release_date}</p>
		</div>

		<!-- Aspect Ratio Container for Video -->
		<div class="relative w-full aspect-video mb-4">
			<!-- This enforces 16:9 -->
			<div
				class="absolute inset-0 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden"
			>
				<iframe
					src={iframeSources[selectedSource]}
					class="w-full h-full"
					allowfullscreen
					loading="lazy"
					title="Movie Player"
					scrolling="no"
				></iframe>
			</div>
		</div>

		<!-- Player Controls -->
		<div
			class="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-900 rounded-lg flex-shrink-0"
		>
			<!-- Server Selection -->
			<div class="flex items-center gap-2 flex-wrap">
				<span class="text-sm font-medium text-gray-400">Server:</span>
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
			<!-- Add to Home Button (Mobile/Tablet) -->
			{#if user}
				<button
					class="md:hidden flex items-center gap-2 p-2 text-sm transition-colors duration-200 bg-black border border-gray-700 rounded-lg hover:bg-gray-800"
					onclick={toggleHomeStatus}
					title={isAddedToHome ? 'Remove from Home' : 'Add to Home'}
				>
					<Heart
						size={16}
						color={isAddedToHome ? '#fb2c36' : 'white'}
						fill={isAddedToHome ? '#fb2c36' : 'none'}
					/>
					<span>{isAddedToHome ? 'Added' : 'Add'}</span>
				</button>
			{/if}
		</div>
	</section>

	<!-- Movie Details Section - Scrollable with limited height -->
	<section class="p-4 md:p-6 space-y-6 overflow-y-auto flex-shrink-0 max-h-[35vh] no-scrollbar">
		<!-- Adjust max-h as needed -->
		<div class="p-6 bg-gray-900 rounded-lg">
			<div class="flex flex-col gap-6 md:flex-row">
				<img
					src={`https://image.tmdb.org/t/p/w500${movie_data.poster_path}`}
					alt={`${movie_data.title} Poster`}
					class="w-40 rounded-lg shadow-lg md:w-48 border border-gray-700 self-start"
				/>

				<div class="flex-1">
					<div class="flex flex-wrap items-start justify-between gap-2 mb-4">
						<!-- Title and Release Date moved above player -->
						<!-- Add to Home Button (Desktop) -->
						{#if user}
							<button
								class="hidden md:flex items-center gap-2 p-2 transition-colors duration-200 bg-black border border-gray-700 rounded-lg hover:bg-gray-800"
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
					</div>
					<p class="text-gray-300 leading-relaxed mb-6">{movie_data.overview}</p>

					<!-- Genres -->
					<div class="mt-4">
						<h4 class="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">Genres</h4>
						<div class="flex flex-wrap gap-2">
							{#each movie_data.genres as genre}
								<span
									class="px-3 py-1 text-sm bg-gray-800 border border-gray-700 rounded-full text-gray-300"
								>
									{genre.name}
								</span>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Production Details -->
			<div class="mt-8 pt-6 border-t border-gray-800">
				<h3 class="mb-4 text-xl font-bold">Production Details</h3>
				<dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div>
						<dt class="text-gray-400 font-medium mb-1">Status</dt>
						<dd class="text-white">{movie_data.status}</dd>
					</div>
					<div>
						<dt class="text-gray-400 font-medium mb-1">Original Language</dt>
						<dd class="text-white">{movie_data.original_language}</dd>
					</div>
					<div>
						<dt class="text-gray-400 font-medium mb-1">Runtime</dt>
						<dd class="text-white">{movie_data.runtime} minutes</dd>
					</div>
					<div>
						<dt class="text-gray-400 font-medium mb-1">Budget</dt>
						<dd class="text-white">${movie_data.budget?.toLocaleString() || 'N/A'}</dd>
					</div>
					<div>
						<dt class="text-gray-400 font-medium mb-1">Revenue</dt>
						<dd class="text-white">${movie_data.revenue?.toLocaleString() || 'N/A'}</dd>
					</div>
					<div>
						<dt class="text-gray-400 font-medium mb-1">Production Companies</dt>
						<dd class="text-white">
							{#if movie_data.production_companies && movie_data.production_companies.length > 0}
								{#each movie_data.production_companies as company, index}
									<span>
										{company.name}{index < movie_data.production_companies.length - 1 ? ', ' : ''}
									</span>
								{/each}
							{:else}
								N/A
							{/if}
						</dd>
					</div>
					<div class="md:col-span-2">
						<dt class="text-gray-400 font-medium mb-1">Country of Origin</dt>
						<dd class="text-white">
							{#if movie_data.production_countries && movie_data.production_countries.length > 0}
								{#each movie_data.production_countries as country, index}
									<span>
										{country.name}{index < movie_data.production_countries.length - 1 ? ', ' : ''}
									</span>
								{/each}
							{:else}
								N/A
							{/if}
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</section>

	<!-- Recommendations Section -->
	<!--      
    <section class="p-4 md:p-6 flex-shrink-0">
        <h2 class="text-xl font-bold md:text-2xl mb-4">Recommendations</h2>

        <div class="relative">
            <button
                class="absolute z-10 left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                onclick={() => scrollLeft(recommendationsScrollRef)}
                aria-label="Scroll recommendations left"
            >
                <ArrowLeft size={20} />
            </button>
            <button
                class="absolute z-10 right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                onclick={() => scrollRight(recommendationsScrollRef)}
                aria-label="Scroll recommendations right"
            >
                <ArrowRight size={20} />
            </button>

            <div
                bind:this={recommendationsScrollRef}
                class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8 py-2"
                in:fade
            >
                {#if recommendation_data?.results?.length > 0}
                    {#each recommendation_data.results as moviee (moviee.id)}
        <div class="flex-shrink-0 w-[160px]">
            <button
            onclick={()=>{
                throw redirect(`/movie/${moviee.id}`)
            }}
            >
                <MovieCard
                    id={moviee.id}
                    poster_path={moviee.poster_path}
                    title={moviee.title}
                    vote_average={moviee.vote_average}
                    release_date={moviee.release_date}
                    genre_ids={moviee.genre_ids}
                />
        </button>

            </div>
                    {/each}
                {:else}
                    <p class="text-gray-500 italic py-4">No recommendations available.</p>
                {/if}
            </div>
        </div>
    </section> -->
</div>

<style>
	ava .no-scrollbar::-webkit-scrollbar {
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
