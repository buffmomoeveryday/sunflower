<script>
	import MovieCard from '$lib/components/card/MovieCard.svelte';
	import SeriesCard from '$lib/components/card/SeriesCard.svelte';
	import AnimeCard from '$lib/components/card/AnimeCard.svelte';
	import { MoveLeft, MoveRight, Search, Clock, X, Filter } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let search = $state('');
	let loading = $state(false);
	let movieResults = $state([]);
	let errorMessage = $state('');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let videoType = $state('tv');
	let previousSearches = $state([]);
	let showFilters = $state(false);
	let genres = $state([]);
	let selectedGenre = $state('');
	let sortBy = $state('popularity.desc');
	let year = $state('');

	const searchMovie = async (event, page = 1) => {
		event?.preventDefault();
		if (!search.trim()) return;
		
		loading = true;
		errorMessage = '';

		const formData = new FormData();
		formData.append('search', search.trim());
		formData.append('page', page);
		formData.append('videoType', videoType);
		// formData.append('bollywood', bollywood || null);
		formData.append('genre', selectedGenre);
		formData.append('sortBy', sortBy);
		formData.append('year', year);

		try {
			const response = await fetch('/api/movie', {
				method: 'POST',
				body: formData
			});
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}
			const json = await response.json();

			console.log(json)

			if (json.success) {
				movieResults = json.searchResults;
				totalPages = json.total_pages;
				currentPage = json.current_page;

				const searchEntry = { 
					query: search.trim(), 
					type: videoType, 
					timestamp: Date.now() 
				};
				
				previousSearches = previousSearches.filter(
					entry => !(entry.query === search.trim() && entry.type === videoType)
				);
				
				previousSearches = [searchEntry, ...previousSearches];
				if (previousSearches.length > 8) {
					previousSearches = previousSearches.slice(0, 8);
				}
				localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
			} else {
				errorMessage = json.error;
				movieResults = [];
			}
		} catch (error) {
			errorMessage = 'Failed to fetch search results. Please try again.';
			movieResults = [];
			console.error(error);
		} finally {
			loading = false;
		}
	};

	const changePage = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages && !loading) {
			searchMovie(null, newPage);
		}
	};

	const performPreviousSearch = (query, type) => {
		search = query;
		videoType = type;
		searchMovie(null, 1);
	};

	const clearPreviousSearches = () => {
		previousSearches = [];
		localStorage.removeItem('previousSearches');
	};

	const removeSearch = (index) => {
		previousSearches.splice(index, 1);
		localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
	};

	const getTypeLabel = (type) => {
		switch(type) {
			case 'movie': return 'Movie';
			case 'tv': return 'Series';
			case 'anime': return 'Anime';
			default: return type;
		}
	};

	const formatTimeAgo = (timestamp) => {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		
		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return 'Just now';
	};

	onMount(() => {
		const stored = localStorage.getItem('previousSearches');
		if (stored) {
			try {
				previousSearches = JSON.parse(stored);
			} catch (e) {
				previousSearches = [];
			}
		}
	});

	// Clear results when changing video type
	$effect(() => {
		if (videoType) {
			movieResults = [];
			currentPage = 1;
			totalPages = 1;
			errorMessage = '';
		}
		
	});
</script>

<div class="min-h-screen bg-black">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-white mb-2">
				{videoType === 'anime' ? '🎌 Anime' : videoType === 'movie' ? '🎬 Movie' : '📺 Series'} Search
			</h1>
			<p class="text-gray-400">
				{videoType === 'anime' ? 'Discover anime from AniList' : 'Discover movies and series from TMDB'}
			</p>
		</div>

		<!-- Search Form -->
		<div class="max-w-4xl mx-auto mb-8">
			<form
				onsubmit={searchMovie}
				class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl"
			>
				<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
					<!-- Search Input -->
					<div class="md:col-span-6">
						<label class="block text-sm font-medium text-gray-300 mb-2">Search Query</label>
						<div class="relative">
							<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								bind:value={search}
								placeholder="Enter {getTypeLabel(videoType).toLowerCase()} title..."
								required
								class="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
							/>
						</div>
					</div>

					<!-- Video Type -->
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-300 mb-2">Type</label>
						<select
							bind:value={videoType}
							class="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
						>
							<option value="tv">Series</option>
							<option value="movie">Movie</option>
							<option value="anime">Anime</option>
						</select>
					</div>

					<!-- Year Filter -->
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-300 mb-2">Year</label>
						<input
							type="number"
							bind:value={year}
							placeholder="2024"
							min="1900"
							max="2030"
							class="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
						/>
					</div>

					<!-- Search Button -->
					<div class="md:col-span-2">
						<button
							type="submit"
							disabled={loading || !search.trim()}
							class="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-medium transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{#if loading}
								<div class="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
								Searching...
							{:else}
								<Search class="w-5 h-5" />
								Search
							{/if}
						</button>
					</div>
				</div>

				<!-- Advanced Filters Toggle -->
				<div class="mt-4 flex justify-center">
					<button
						type="button"
						onclick={() => showFilters = !showFilters}
						class="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
					>
						<Filter class="w-4 h-4" />
						{showFilters ? 'Hide' : 'Show'} Advanced Filters
					</button>
				</div>

				<!-- Advanced Filters -->
				{#if showFilters}
					<div class="mt-4 pt-4 border-t border-gray-700">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if videoType !== 'anime'}
								<div>
									<label class="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
									<select
										bind:value={sortBy}
										class="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="popularity.desc">Popularity (High to Low)</option>
										<option value="popularity.asc">Popularity (Low to High)</option>
										<option value="release_date.desc">Release Date (Newest)</option>
										<option value="release_date.asc">Release Date (Oldest)</option>
										<option value="vote_average.desc">Rating (High to Low)</option>
										<option value="vote_average.asc">Rating (Low to High)</option>
									</select>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</form>
		</div>

		<!-- Previous Searches -->
		{#if previousSearches.length > 0}
			<div class="max-w-4xl mx-auto mb-8">
				<div class="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
					<div class="flex items-center justify-between mb-3">
						<h2 class="text-lg font-medium text-white flex items-center gap-2">
							<Clock class="w-5 h-5" />
							Recent Searches
						</h2>
						<button
							onclick={clearPreviousSearches}
							class="text-gray-400 hover:text-red-400 transition-colors text-sm"
						>
							Clear All
						</button>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each previousSearches as { query, type, timestamp }, index}
							<div class="group relative">
								<button
									onclick={() => performPreviousSearch(query, type)}
									class="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all flex items-center gap-2 text-sm border border-gray-600/50"
								>
									<span>{query}</span>
									<span class="text-gray-400">({getTypeLabel(type)})</span>
									<span class="text-xs text-gray-500">{formatTimeAgo(timestamp)}</span>
								</button>
								<button
									onclick={() => removeSearch(index)}
									class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
								>
									<X class="w-3 h-3 text-white" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Error Message -->
		{#if errorMessage}
			<div class="max-w-4xl mx-auto mb-6">
				<div class="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl">
					<div class="flex items-center gap-2">
						<span class="text-red-400">⚠️</span>
						{errorMessage}
					</div>
				</div>
			</div>
		{/if}

		<!-- Results -->
		{#if movieResults.length > 0}
			<div class="mb-8">
				<h2 class="text-2xl font-bold text-white mb-4">
					Search Results ({movieResults.length} {movieResults.length === 1 ? 'result' : 'results'})
				</h2>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
					{#each movieResults.filter((movie) => movie.poster_path || movie.image || movie.coverImage) as movie}
						<div class="flex justify-center">
							{#if videoType === 'movie'}
								<MovieCard {...movie} />
							{:else if videoType === 'anime'}

								<AnimeCard id={movie.id} name={movie.name} vote={movie.vote_average} poster={movie.image} startDate={movie.first_air_date}/>
							{:else}
								<SeriesCard {...movie} />
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else if !loading && search && !errorMessage}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🔍</div>
				<h3 class="text-xl font-medium text-gray-300 mb-2">No results found</h3>
				<p class="text-gray-500">Try different keywords or check your spelling</p>
			</div>
		{/if}

		<!-- Loading State -->
		{#if loading}
			<div class="text-center py-12">
				<div class="inline-flex items-center gap-3 text-gray-400">
					<div class="w-8 h-8 border-2 border-gray-400 rounded-full animate-spin border-t-transparent"></div>
					<span class="text-lg">Searching {getTypeLabel(videoType).toLowerCase()}s...</span>
				</div>
			</div>
		{/if}

		<!-- Pagination -->
		{#if totalPages > 1 && !loading}
			<div class="flex items-center justify-center mt-8">
				<div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
					<div class="flex items-center space-x-4">
						<button
							onclick={() => changePage(currentPage - 1)}
							disabled={currentPage === 1}
							class="p-2 text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							<MoveLeft class="w-5 h-5" />
						</button>
						
						<div class="flex items-center space-x-2">
							{#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
								const start = Math.max(1, currentPage - 2);
								const end = Math.min(totalPages, start + 4);
								return start + i;
							}).filter(page => page <= totalPages) as page}
								<button
									onclick={() => changePage(page)}
									class="px-3 py-1 rounded-lg text-sm font-medium transition-all {currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}"
								>
									{page}
								</button>
							{/each}
						</div>
						
						<button
							onclick={() => changePage(currentPage + 1)}
							disabled={currentPage === totalPages}
							class="p-2 text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							<MoveRight class="w-5 h-5" />
						</button>
					</div>
					
					<div class="text-center mt-2 text-sm text-gray-400">
						Page {currentPage} of {totalPages}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Custom scrollbar */
	:global(html) {
		scrollbar-width: thin;
		scrollbar-color: #4a5568 #1a202c;
	}

	:global(html::-webkit-scrollbar) {
		width: 8px;
	}

	:global(html::-webkit-scrollbar-track) {
		background: #1a202c;
	}

	:global(html::-webkit-scrollbar-thumb) {
		background: #4a5568;
		border-radius: 4px;
	}

	:global(html::-webkit-scrollbar-thumb:hover) {
		background: #718096;
	}
</style>