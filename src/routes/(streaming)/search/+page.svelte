<script>
	import { goto } from "$app/navigation";
	import { tick } from "svelte";
	import { Search, MoveLeft, MoveRight, Filter, X, ChevronDown, ChevronUp } from "lucide-svelte";

	import { search as searchRemote } from "$lib/remote/search.remote";
	import { discover as discoverRemote } from "$lib/remote/discover.remote";
	import { searchSemantic } from "$lib/remote/semantic.remote";
	import MovieCard from "$lib/components/card/MovieCard.svelte";
	import SeriesCard from "$lib/components/card/SeriesCard.svelte";
	import { Sparkles } from "lucide-svelte";

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

	let semanticSearch = $state("");
	let isSemanticMode = $state(false);

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
							(item.genre_ids && selectedGenres.every((id) => item.genre_ids.includes(Number(id))));

						const itemYear = (item.release_date || item.first_air_date || "").split("-")[0];
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
		if (isSemanticMode) return;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchMovie(1);
		}, 500);
	};

	const trySemanticWithCurrentQuery = async () => {
		if (!search.trim()) return;
		semanticSearch = search;
		isSemanticMode = true;
		await tick();
		await handleSemanticSearch();
	};

	const handleSemanticSearch = async () => {
		if (!semanticSearch.trim()) return;
		errorMessage = "";
		loading = true;
		hasSearched = true;
		results = [];

		try {
			const res = await searchSemantic(semanticSearch);
			if (res.success) {
				results = res.searchResults;
				totalPages = 1;
				currentPage = 1;
			} else {
				errorMessage = res.error || "Failed to fetch semantic results";
			}
		} catch (err) {
			errorMessage = "An unexpected error occurred during semantic search.";
			console.error(err);
		} finally {
			loading = false;
		}
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
			selectedGenres = selectedGenres.filter((id) => id !== genreId);
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
		<h1 class="text-4xl md:text-5xl font-black mb-4 text-white">Find Your Next Favorite</h1>
		<p class="text-gray-400 max-w-2xl mx-auto mb-8">
			Search through thousands of movies and TV shows.
		</p>

		<div class="flex justify-center gap-4 mb-6">
			<button
				onclick={() => {
					isSemanticMode = false;
					hasSearched = false;
					results = [];
				}}
				class="px-6 py-2 rounded-full text-sm font-bold transition-all {!isSemanticMode
					? 'bg-white text-black shadow-lg'
					: 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-white'}"
			>
				Standard
			</button>
			<button
				onclick={() => {
					isSemanticMode = true;
					hasSearched = false;
					results = [];
				}}
				class="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all {isSemanticMode
					? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20'
					: 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-white'}"
			>
				<Sparkles class="w-4 h-4" />
				Semantic AI
			</button>
		</div>

		<div class="relative max-w-3xl mx-auto">
			{#if !isSemanticMode}
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
						onclick={() => {
							search = "";
							handleInput();
						}}
						class="absolute inset-y-0 right-14 flex items-center text-gray-400 hover:text-white"
					>
						<X class="w-5 h-5" />
					</button>
				{/if}
				<button
					onclick={() => (showFilters = !showFilters)}
					class="absolute inset-y-0 right-4 flex items-center {showFilters
						? 'text-pink-500'
						: 'text-gray-400'} hover:text-white"
				>
					<Filter class="w-6 h-6" />
				</button>
			{:else}
				<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
					<Sparkles class="w-6 h-6 text-pink-500" />
				</div>
				<input
					type="text"
					bind:value={semanticSearch}
					onkeydown={(e) => e.key === "Enter" && handleSemanticSearch()}
					placeholder="Describe your movie or series (e.g. 'time travel crime drama')..."
					class="w-full pl-12 pr-28 py-4 rounded-2xl bg-gray-900/50 backdrop-blur-md border border-pink-500/30 text-white text-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none shadow-xl shadow-pink-500/10"
				/>
				<button
					onclick={handleSemanticSearch}
					class="absolute right-3 inset-y-2 px-6 rounded-xl bg-pink-600 text-white text-sm font-bold hover:bg-pink-700 transition-all active:scale-95"
				>
					AI Search
				</button>
			{/if}
		</div>
	</div>

	<!-- Expandable Filters Panel: max height + inner scroll so the page itself does not grow -->
	{#if showFilters}
		<div
			class="search-filters-panel mb-6 flex max-h-[min(52svh,28rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900/90 via-gray-950/85 to-black/75 shadow-xl shadow-black/30 backdrop-blur-xl sm:max-h-[min(58svh,32rem)] lg:max-h-[min(62svh,36rem)]"
		>
			<div
				class="flex shrink-0 flex-col gap-1 border-b border-white/5 bg-black/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4"
			>
				<div class="min-w-0">
					<h2 class="text-sm font-bold tracking-tight text-white sm:text-base">Refine results</h2>
					<p class="truncate text-[11px] text-gray-500 sm:text-xs">
						Standard search & browse — scroll inside this panel for genres.
					</p>
				</div>
				<div class="flex shrink-0 items-center gap-2 pt-1.5 sm:pt-0">
					{#if selectedGenres.length > 0 || yearFrom || yearTo || filter !== "all"}
						<span
							class="rounded-full border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-[10px] font-semibold text-pink-300 sm:text-[11px]"
						>
							{selectedGenres.length +
								(yearFrom ? 1 : 0) +
								(yearTo ? 1 : 0) +
								(filter !== "all" ? 1 : 0)}
							on
						</span>
					{/if}
					<button
						type="button"
						onclick={clearFilters}
						class="rounded-lg border border-gray-700 bg-gray-900/80 px-2.5 py-1 text-[11px] font-semibold text-gray-300 transition hover:border-pink-500/40 hover:text-white sm:px-3 sm:py-1.5 sm:text-xs"
					>
						Reset all
					</button>
				</div>
			</div>

			<div
				class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4 sm:py-3"
			>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
					<!-- Media type -->
					<div class="sm:col-span-1 lg:col-span-4">
						<p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
							Media type
						</p>
						<div
							class="grid grid-cols-3 gap-1 rounded-xl border border-gray-800/80 bg-black/30 p-1"
							role="group"
							aria-label="Media type"
						>
							{#each ["all", "movies", "tv"] as t}
								<button
									type="button"
									onclick={() => {
										filter = t;
										selectedGenres = [];
										handleFilterChange();
									}}
									class="rounded-lg px-1.5 py-1.5 text-center text-[11px] font-semibold capitalize transition-all sm:py-2 sm:text-xs {filter ===
									t
										? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
										: 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'}"
								>
									{t === "tv" ? "TV" : t}
								</button>
							{/each}
						</div>
					</div>

					<!-- Year range -->
					<div class="sm:col-span-1 lg:col-span-8">
						<p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
							Release years
						</p>
						<div class="grid grid-cols-2 gap-2">
							<label class="flex flex-col gap-0.5">
								<span class="text-[10px] text-gray-500">From</span>
								<select
									bind:value={yearFrom}
									onchange={handleFilterChange}
									class="search-filter-select w-full cursor-pointer rounded-lg border border-gray-700/90 bg-gray-900/90 py-1.5 pl-2 pr-7 text-xs text-white outline-none transition focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/25 sm:py-2 sm:text-sm"
								>
									<option value="">Any</option>
									{#each years as y}
										<option value={y.toString()}>{y}</option>
									{/each}
								</select>
							</label>
							<label class="flex flex-col gap-0.5">
								<span class="text-[10px] text-gray-500">To</span>
								<select
									bind:value={yearTo}
									onchange={handleFilterChange}
									class="search-filter-select w-full cursor-pointer rounded-lg border border-gray-700/90 bg-gray-900/90 py-1.5 pl-2 pr-7 text-xs text-white outline-none transition focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/25 sm:py-2 sm:text-sm"
								>
									<option value="">Any</option>
									{#each years as y}
										<option value={y.toString()}>{y}</option>
									{/each}
								</select>
							</label>
						</div>
					</div>
				</div>

				<!-- Genres (dense grid; scroll is the parent panel) -->
				<div class="mt-3 border-t border-white/5 pt-3">
					<div class="mb-2 flex items-center justify-between gap-2">
						<p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Genres</p>
						{#if selectedGenres.length > 0}
							<span class="text-[10px] text-pink-400 sm:text-xs">{selectedGenres.length} selected</span>
						{/if}
					</div>
					<div class="rounded-xl border border-gray-800/60 bg-black/25 p-2 sm:p-2.5">
						<div class="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
							{#each availableGenres as genre}
								<button
									type="button"
									onclick={() => toggleGenre(genre.id)}
									class="rounded-lg border px-1.5 py-1.5 text-left text-[10px] font-medium leading-tight transition-all sm:text-[11px] {selectedGenres.includes(
										genre.id
									)
										? 'border-pink-500/70 bg-pink-600/90 text-white'
										: 'border-gray-700/80 bg-gray-900/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800/70'}"
								>
									{genre.name}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Results Section -->
	{#if loading}
		<div class="flex flex-col items-center justify-center py-20">
			<div
				class="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4"
			></div>
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
					{#if isSemanticMode}
						AI Results for "{semanticSearch}"
					{:else if search}
						Results for "{search}"
					{:else}
						Browsing {filter === "tv" ? "TV Shows" : "Movies"}
					{/if}
				</h2>
				{#if !isSemanticMode}
					<span
						class="text-sm text-gray-500 font-bold uppercase tracking-widest bg-gray-900/50 px-4 py-1 rounded-full border border-gray-800"
					>
						Page {currentPage} of {Math.min(totalPages, 500)}
					</span>
				{/if}
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
				{#each results as item (item.id)}
					<div class="animate-in fade-in zoom-in-95 duration-300">
						{#if item.media_type === "tv" || filter === "tv"}
							<SeriesCard
								tmdb_id={item.id}
								poster_path={item.poster_path}
								name={item.name}
								vote_average={item.vote_average}
								first_air_date={item.first_air_date}
								number_of_seasons={item.number_of_seasons}
								genre_ids={item.genre_ids}
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
			<div
				class="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 mb-6 group hover:border-pink-500/30 transition-all"
			>
				<Search class="w-16 h-16 text-gray-700 group-hover:text-pink-500 transition-colors" />
			</div>
			<p class="text-2xl font-black text-white mb-2">No results found</p>
			<p class="text-gray-500 max-w-sm">
				We couldn't find any matches. Try adjusting your filters or search terms.
			</p>
			{#if !isSemanticMode && search.trim()}
				<p class="text-gray-400 max-w-md mt-4 text-sm leading-relaxed">
					Standard search matches TMDB’s title text closely. For alternate spellings or transliteration
					(e.g. Hindi titles in Latin letters), try Semantic AI — it uses a separate index and may
					still surface the right title.
				</p>
				<button
					type="button"
					onclick={trySemanticWithCurrentQuery}
					class="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl border border-pink-500/40 bg-pink-600/15 text-pink-300 text-sm font-bold hover:bg-pink-600/25 transition-all"
				>
					<Sparkles class="w-4 h-4" />
					Try Semantic AI with this query
				</button>
			{/if}
			<button
				onclick={clearFilters}
				class="mt-6 px-6 py-2 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20"
			>
				Reset All Filters
			</button>
		</div>
	{:else}
		<!-- Initial Landing State -->
		<div
			class="flex flex-col items-center justify-center py-20 text-center opacity-50 grayscale pointer-events-none"
		>
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
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.search-filter-select {
		-webkit-appearance: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.65rem center;
		background-size: 1rem;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 999px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(236, 72, 153, 0.25);
	}
</style>
