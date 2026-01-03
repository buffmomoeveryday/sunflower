<script>
	import { goto } from "$app/navigation";
	import { tick } from "svelte";
	import { Search, MoveLeft, MoveRight, Filter, X, ChevronDown, ChevronUp } from "lucide-svelte";

	import { search as searchRemote } from "$lib/remote/search.remote";
	import { discover as discoverRemote } from "$lib/remote/discover.remote";
	import MovieCard from "$lib/components/card/MovieCard.svelte";
	import SeriesCard from "$lib/components/card/SeriesCard.svelte";

	let { data } = $props();
	const { movieGenres, tvGenres } = data.genres;

	let search = $state("");
	let loading = $state(false);
	let results = $state([]);
	let errorMessage = $state("");
	let currentPage = $state(1);
	let totalPages = $state(1);
	let hasSearched = $state(false);

	let filter = $state("all"); // 'all', 'movies', 'tv'
	let selectedGenres = $state([]);
	let yearFrom = $state("");
	let yearTo = $state("");
	let showFilters = $state(false);
	let debounceTimer = $state();

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

	const availableGenres = $derived.by(() => {
		let genres = [];
		if (filter === "movies") {
			genres = movieGenres;
		} else if (filter === "tv") {
			genres = tvGenres;
		} else {
			const merged = [...movieGenres];
			tvGenres.forEach((g) => {
				if (!merged.find((m) => m.id === g.id)) merged.push(g);
			});
			genres = merged;
		}
		return genres.sort((a, b) => a.name.localeCompare(b.name));
	});

	const searchMovie = async (page = 1) => {
		currentPage = page;
		errorMessage = "";
		loading = true;
		hasSearched = true;

		try {
			let search_results;
			if (search.trim()) {
				// Search mode
				search_results = await searchRemote(search);
				if (search_results.success) {
					results = search_results.searchResults.filter((item) => {
						const matchesType =
							(filter === "all" && (item.media_type === "movie" || item.media_type === "tv")) ||
							(filter === "movies" && item.media_type === "movie") ||
							(filter === "tv" && item.media_type === "tv");

						const matchesGenres =
							selectedGenres.length === 0 ||
							(item.genre_ids && selectedGenres.every(id => item.genre_ids.includes(Number(id))));

						const itemYear = (item.release_date || item.first_air_date || "").split('-')[0];
						const matchesYearFrom = !yearFrom || (itemYear && Number(itemYear) >= Number(yearFrom));
						const matchesYearTo = !yearTo || (itemYear && Number(itemYear) <= Number(yearTo));

						return matchesType && matchesGenres && matchesYearFrom && matchesYearTo;
					});
					totalPages = search_results.total_pages || 1;
				}
			} else if (selectedGenres.length > 0 || yearFrom || yearTo || filter !== "all") {
				// Browse / Discover mode
				const type = filter === "tv" ? "tv" : "movies";
				search_results = await discoverRemote({ 
					type, 
					genreIds: selectedGenres, 
					yearFrom: yearFrom, 
					yearTo: yearTo, 
					page 
				});
				if (search_results.success) {
					results = search_results.searchResults;
					totalPages = Math.min(search_results.total_pages, 500); // TMDB limit
				}
			} else {
				results = [];
				hasSearched = false;
				loading = false;
				return;
			}

			if (!search_results?.success) {
				errorMessage = search_results?.error || "Failed to fetch results";
				results = [];
			}
		} catch (err) {
			errorMessage = "An unexpected error occurred.";
			console.error(err);
		} finally {
			loading = false;
		}
	};

	const handleInput = () => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchMovie(1);
		}, 500);
	};

	const changePage = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages && !loading) {
			searchMovie(newPage);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleFilterChange = () => {
		searchMovie(1);
	};

	const toggleGenre = (genreId) => {
		if (selectedGenres.includes(genreId)) {
			selectedGenres = selectedGenres.filter(id => id !== genreId);
		} else {
			selectedGenres = [...selectedGenres, genreId];
		}
		handleFilterChange();
	};

	const clearFilters = () => {
		selectedGenres = [];
		yearFrom = "";
		yearTo = "";
		filter = "all";
		searchMovie(1);
	};
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
	<!-- Hero / Search Section -->
	<div class="mb-10 text-center">
		<h1 class="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
			Find Your Next Favorite
		</h1>
		<p class="text-gray-400 max-w-2xl mx-auto mb-8">
			Search through thousands of movies and TV shows with advanced filters.
		</p>

		<div class="relative max-w-3xl mx-auto">
			<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
				<Search class="w-6 h-6 text-gray-500" />
			</div>
			<input
				type="text"
				bind:value={search}
				oninput={handleInput}
				placeholder="Search movies & TV shows..."
				class="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-900/50 backdrop-blur-md border border-gray-800 text-white text-lg focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none shadow-xl"
			/>
			{#if search}
				<button 
					onclick={() => { search = ''; handleInput(); }}
					class="absolute inset-y-0 right-14 flex items-center text-gray-400 hover:text-white"
				>
					<X class="w-5 h-5" />
				</button>
			{/if}
			<button 
				onclick={() => showFilters = !showFilters}
				class="absolute inset-y-0 right-4 flex items-center {showFilters ? 'text-pink-500' : 'text-gray-400'} hover:text-white"
			>
				<Filter class="w-6 h-6" />
			</button>
		</div>
	</div>

	<!-- Expandable Filters Panel -->
	{#if showFilters}
		<div class="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 mb-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
			<div class="flex flex-col gap-8">
				<div class="flex flex-col md:flex-row gap-8">
					<!-- Type Filter -->
					<div class="flex-1">
						<span class="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Media Type</span>
						<div class="flex gap-2">
							{#each ['all', 'movies', 'tv'] as t}
								<button
									onclick={() => { filter = t; selectedGenres = []; handleFilterChange(); }}
									class="flex-1 py-1.5 px-4 rounded-xl text-xs font-bold capitalize transition-all {filter === t ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
								>
									{t === 'tv' ? 'TV Shows' : t}
								</button>
							{/each}
						</div>
					</div>

					<!-- Year Range Filter -->
					<div class="flex-1">
						<span class="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Release Year Range</span>
						<div class="flex items-center gap-2">
							<select
								bind:value={yearFrom}
								onchange={handleFilterChange}
								class="flex-1 py-1.5 px-3 rounded-xl bg-gray-800 border border-transparent text-xs text-white focus:border-pink-500/50 outline-none transition-all cursor-pointer"
							>
								<option value="">From</option>
								{#each years as y}
									<option value={y.toString()}>{y}</option>
								{/each}
							</select>
							<span class="text-gray-600">-</span>
							<select
								bind:value={yearTo}
								onchange={handleFilterChange}
								class="flex-1 py-1.5 px-3 rounded-xl bg-gray-800 border border-transparent text-xs text-white focus:border-pink-500/50 outline-none transition-all cursor-pointer"
							>
								<option value="">To</option>
								{#each years as y}
									<option value={y.toString()}>{y}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>

				<!-- Genre Multi-Selection -->
				<div class="flex flex-col">
					<span class="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
						Genres {#if selectedGenres.length > 0}<span class="text-pink-500 ml-1">({selectedGenres.length})</span>{/if}
					</span>
					<div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
						{#each availableGenres as genre}
							<button
								onclick={() => toggleGenre(genre.id)}
								class="py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border {selectedGenres.includes(genre.id) ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-500/10' : 'bg-gray-800/50 text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'}"
							>
								{genre.name}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-6 pt-6 border-t border-gray-800 flex justify-end">
				<button 
					onclick={clearFilters}
					class="text-xs font-bold text-gray-500 hover:text-pink-500 transition-colors"
				>
					Reset Filters
				</button>
			</div>
		</div>
	{/if}

	<!-- Results Section -->
	{#if loading}
		<div class="flex flex-col items-center justify-center py-20">
			<div class="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4"></div>
			<p class="text-gray-500 animate-pulse font-medium">Searching the stars...</p>
		</div>
	{:else if errorMessage}
		<div class="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center mb-8">
			<p class="text-red-400 font-bold">{errorMessage}</p>
		</div>
	{:else if results.length > 0}
		<div id="results-section">
			<div class="flex items-center justify-between mb-8">
				<h2 class="text-2xl font-black text-white">
					{#if search}
						Results for "{search}"
					{:else}
						Browsing {filter === 'tv' ? 'TV Shows' : 'Movies'}
					{/if}
				</h2>
				<span class="text-sm text-gray-500 font-bold uppercase tracking-widest bg-gray-900/50 px-4 py-1 rounded-full border border-gray-800">
					Page {currentPage} of {Math.min(totalPages, 500)}
				</span>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
				{#each results as item (item.id)}
					<div class="animate-in fade-in zoom-in-95 duration-300">
						{#if item.media_type === "tv" || filter === 'tv'}
							<SeriesCard
								tmdb_id={item.id}
								poster_path={item.poster_path}
								name={item.name}
								vote_average={item.vote_average}
								first_air_date={item.first_air_date}
								number_of_seasons={item.number_of_seasons}
							/>
						{:else}
							<MovieCard {...item} />
						{/if}
					</div>
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="flex items-center justify-center mt-12 gap-2">
					<button
						onclick={() => changePage(1)}
						disabled={currentPage === 1}
						class="p-3 bg-gray-900 border border-gray-800 rounded-xl disabled:opacity-30 hover:bg-gray-800 transition-all"
					>
						<MoveLeft class="w-5 h-5" />
					</button>

					<div class="flex gap-1">
						{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							const startPage = Math.max(1, currentPage - 2);
							const endPage = Math.min(totalPages, startPage + 4);
							return startPage + i;
						}).filter((page) => page <= totalPages && page <= 500) as pageNum}
							<button
								onclick={() => changePage(pageNum)}
								class="w-11 h-11 rounded-xl font-bold transition-all {currentPage === pageNum
									? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20 scale-110'
									: 'bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800'}"
							>
								{pageNum}
							</button>
						{/each}
					</div>

					<button
						onclick={() => changePage(currentPage + 1)}
						disabled={currentPage === totalPages || currentPage >= 500}
						class="p-3 bg-gray-900 border border-gray-800 rounded-xl disabled:opacity-30 hover:bg-gray-800 transition-all"
					>
						<MoveRight class="w-5 h-5" />
					</button>
				</div>
			{/if}
		</div>
	{:else if hasSearched}
		<div class="flex flex-col items-center justify-center py-32 text-center">
			<div class="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 mb-6 group hover:border-pink-500/30 transition-all">
				<Search class="w-16 h-16 text-gray-700 group-hover:text-pink-500 transition-colors" />
			</div>
			<p class="text-2xl font-black text-white mb-2">No results found</p>
			<p class="text-gray-500 max-w-sm">We couldn't find any matches. Try adjusting your filters or search terms.</p>
			<button 
				onclick={clearFilters}
				class="mt-6 px-6 py-2 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20"
			>
				Reset All Filters
			</button>
		</div>
	{:else}
		<!-- Initial Landing State -->
		<div class="flex flex-col items-center justify-center py-20 text-center opacity-50 grayscale pointer-events-none">
			<div class="flex gap-4 mb-8">
				{#each [1, 2, 3] as i}
					<div class="w-40 h-60 bg-gray-900 rounded-2xl border border-gray-800"></div>
				{/each}
			</div>
			<p class="text-gray-500 font-medium">Enter a query or use filters to start browsing</p>
		</div>
	{/if}
</div>

<style>
	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(236, 72, 153, 0.3);
	}
</style>
