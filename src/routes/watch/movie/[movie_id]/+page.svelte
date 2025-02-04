<script>
	import { Heart } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let isAddedToHome = $state(false);
	let { data } = $props();

	let user = data.user;
	let movie_data = data.movieData;
	let movie_id = $page.params.movie_id;

	let iframeSources = $state([
		`https://vidsrc.dev/embed/movie/${movie_id}`,
		`https://vidsrc.icu/embed/movie/${movie_id}`,
		`https://vidsrc.cc/v3/embed/movie/${movie_id}?autoPlay=true`,
		`https://vidsrc.to/embed/movie/${movie_id}`
	]);

	let selectedSource = $state(0);

	function changeSource(index) {
		selectedSource = index;
	}

	const HOME_STORAGE_KEY = 'homepage_movies';

	async function fetchMovieWatchlistStatus() {
		try {
			const response = await fetch(`/api/movie/watchlist/get`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user_id: user.id, // User ID
					tmdb_id: movie_id // TMDB ID
				})
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch movie watchlist status: ${response.statusText}`);
			}

			const data = await response.json();
			if (data) isAddedToHome = true;
		} catch (error) {
			console.error('Error fetching movie watchlist status:', error);
			toast.error('Failed to check watchlist status.');
			isAddedToHome = false;
		}
	}

	async function toggleHomeStatus() {
		try {
			const postData = {
				user_id: user.id,
				tmdb_id: movie_data.id,
				title: movie_data.title,
				poster_path: movie_data.poster_path,
				average_ratings: movie_data.vote_average
			};

			const response = await fetch('/api/movie/watchlist/save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(postData)
			});

			if (!response.ok) {
				const { error } = await response.json();
				throw new Error(error || 'Failed to update watchlist');
			}

			const result = await response.json();

			if (result.action === 'added') {
				// Add to local storage
				const storedMovies = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
				const moviesData = {
					id: movie_data.id,
					name: movie_data.original_name,
					poster_path: movie_data.poster_path,
					first_air_date: movie_data.first_air_date,
					vote_average: movie_data.vote_average,
					addedAt: new Date().toISOString()
				};
				storedMovies.push(moviesData);
				localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(storedMovies));
				toast.success('Added to the list');
				isAddedToHome = true;
			} else if (result.action === 'removed') {
				// Remove from local storage
				isAddedToHome = false;
				const storedMovies = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
				const updatedMovies = storedMovies.filter((movie) => movie.id !== movie_data.id);
				localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(updatedMovies));
				toast.success('Removed from the list');
			}
		} catch (error) {
			console.error(error);
			toast.error('Something went wrong');
		}
	}

	onMount(() => {
		fetchMovieWatchlistStatus();
	});
</script>

<div class="min-h-screen text-white bg-black">
	<div class="relative w-full overflow-hidden">
		<div class="container px-4 mx-auto mt-8 md:px-8">
			<div class="relative w-full rounded-lg shadow-2xl aspect-video">
				<iframe
					src={iframeSources[selectedSource]}
					class="absolute w-full h-full"
					allowfullscreen
					loading="lazy"
					title="Movie Player"
				></iframe>
			</div>
		</div>
	</div>

	<!-- Centered Buttons -->
	<div class="flex flex-wrap justify-center gap-2 mt-4">
		{#each iframeSources as source, index}
			<button
				class={'px-3 py-2 text-sm font-semibold rounded-md ' +
					(index === selectedSource ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700')}
				onclick={() => changeSource(index)}
			>
				Server {index + 1}
			</button>
		{/each}
	</div>

	<!-- Movie Details -->
	<div class="container px-4 py-8 mx-auto md:px-8 md:py-12">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Left Column -->
			<div class="lg:col-span-2">
				<div class="flex flex-col gap-6 md:flex-row">
					<img
						src={`https://image.tmdb.org/t/p/w500${movie_data.poster_path}`}
						alt="Movie Poster"
						class="w-40 rounded-lg shadow-lg md:w-48"
					/>

					<div class="flex-1">
						<h1 class="text-3xl font-bold md:text-4xl">
							<span class="flex gap-2 flex-rows">
								{movie_data.title || movie_data.original_language}
								<button
									class="flex items-center gap-2 p-2 transition-colors duration-200 bg-black border border-black rounded-lg hover:bg-gray-800"
									onclick={toggleHomeStatus}
								>
									<Heart
										size={24}
										color={isAddedToHome ? '#fb2c36' : 'white'}
										fill={isAddedToHome ? '#fb2c36' : 'none'}
									/>
								</button>
							</span>
						</h1>
						<p class="mt-2 text-gray-400">{movie_data.release_date}</p>
						<p class="mt-2 text-gray-300">{movie_data.overview}</p>
					</div>
				</div>

				<!-- Genres -->
				<div class="flex flex-wrap gap-2 mt-6">
					{#each movie_data.genres as genre}
						<span class="px-3 py-1 text-sm bg-gray-800 rounded-full hover:bg-gray-700">
							{genre.name}
						</span>
					{/each}
				</div>
			</div>

			<!-- Right Column: Production Details -->
			<div class="p-6 bg-gray-900 rounded-lg shadow-md">
				<h3 class="mb-4 text-lg font-semibold">Production Details</h3>
				<dl class="space-y-2 text-sm">
					<div>
						<dt class="text-gray-400">Status</dt>
						<dd>{movie_data.status}</dd>
					</div>
					<div>
						<dt class="text-gray-400">Original Language</dt>
						<dd>{movie_data.original_language}</dd>
					</div>
					<div>
						<dt class="text-gray-400">Title</dt>
						<dd>{movie_data.title}</dd>
					</div>

					<div>
						<dt class="text-gray-400">Production Companies</dt>
						<dd>
							{#each movie_data.production_companies as company, i (company.id)}
								<span
									>{company.name}{i < movie_data.production_companies.length - 1 ? ', ' : ''}</span
								>
							{/each}
						</dd>
					</div>
					<div>
						<dt class="text-gray-400">Country of Origin</dt>
						<dd>
							{#each movie_data.production_countries as country, i (country.iso_3166_1)}
								<span
									>{country.name}{i < movie_data.production_countries.length - 1 ? ', ' : ''}</span
								>
							{/each}
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</div>
