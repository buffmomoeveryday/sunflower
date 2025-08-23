<script>
	import { goto } from "$app/navigation";
	import { tick } from "svelte";

	import { Search, MoveLeft, MoveRight } from "lucide-svelte";

	import { search as searchRemote } from "../../../lib/remote/search.remote";
	import MovieCard from "$lib/components/card/MovieCard.svelte";
	import SeriesCard from "$lib/components/card/SeriesCard.svelte";

	let search = $state("");
	let loading = $state(false);
	let results = $state([]);
	let errorMessage = $state("");
	let currentPage = $state(1);
	let totalPages = $state(1);
	let hasSearched = $state(false);

	let sort = $state("best");
	let filter = $state("all");
	let debounceTimer = $state();

	const RESULTS_PER_PAGE = 20;

	const searchMovie = async (page = 1) => {
		if (!search.trim()) {
			results = [];
			hasSearched = false;
			return;
		}

		loading = true;
		errorMessage = "";
		hasSearched = true;

		try {
			const search_results = await searchRemote(search);
			if (search_results.success) {
				let filteredResults = search_results.searchResults.filter(
					(item) =>
						(filter === "all" && (item.media_type === "movie" || item.media_type === "tv")) ||
						(filter === "movies" && item.media_type === "movie") ||
						(filter === "tv" && item.media_type === "tv")
				);

				results = filteredResults.slice(0, RESULTS_PER_PAGE);

				const totalResults = search_results.total_results || filteredResults.length;
				totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
				currentPage = page;

				if (results.length < RESULTS_PER_PAGE && page > 1) {
					totalPages = page;
				}
				if (page === 2) {
					await tick();
					document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
				}
			} else {
				errorMessage = search_results.error;
				results = [];
				totalPages = 1;
				currentPage = 1;
			}
		} catch (err) {
			errorMessage = "Failed to fetch search results. Please try again.";
			results = [];
			totalPages = 1;
			currentPage = 1;
			console.error(err);
		} finally {
			loading = false;
		}
	};

	const handleInput = () => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			currentPage = 1;
			searchMovie(1);
		}, 500);
	};

	const changePage = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages && !loading) {
			searchMovie(newPage);
		}
	};

	const handleFilterChange = (newSort, newFilter) => {
		if (newSort !== undefined) sort = newSort;
		if (newFilter !== undefined) filter = newFilter;
		currentPage = 1;
		searchMovie(1);
	};
</script>

<div class="max-w-6xl mx-auto">
	<!-- Search Bar -->
	<div class="flex gap-3 mb-6">
		<input
			autofocus
			type="text"
			bind:value={search}
			oninput={handleInput}
			placeholder="Search movies & TV shows..."
			class="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white"
		/>
		{#if loading}
			<div class="flex items-center px-4">
				<div
					class="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"
				></div>
			</div>
		{/if}
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3 mb-6">
		<span class="text-gray-400">Sort:</span>
		<button
			class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {sort === 'best'
				? 'ring-2 ring-white'
				: ''}"
			onclick={() => handleFilterChange("best")}>Best Match</button
		>
		<button
			class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {sort === 'newest'
				? 'ring-2 ring-white'
				: ''}"
			onclick={() => handleFilterChange("newest")}>Newest First</button
		>
		<button
			class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {sort === 'oldest'
				? 'ring-2 ring-white'
				: ''}"
			onclick={() => handleFilterChange("oldest")}>Oldest First</button
		>
		<button
			class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {sort === 'rating'
				? 'ring-2 ring-white'
				: ''}"
			onclick={() => handleFilterChange("rating")}>Highest Rated</button
		>

		<span class="ml-6 text-gray-400">Show:</span>
		<button
			class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {filter === 'all'
				? 'ring-2 ring-white'
				: ''}"
			onclick={() => handleFilterChange(undefined, "all")}>All</button
		>
		<button
			class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {filter === 'movies'
				? 'ring-2 ring-white'
				: ''}"
			onclick={() => handleFilterChange(undefined, "movies")}>Movies</button
		>
		<button
			class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {filter === 'tv'
				? 'ring-2 ring-white'
				: ''}"
			onclick={() => handleFilterChange(undefined, "tv")}>TV Shows</button
		>
	</div>

	{#if errorMessage}
		<div class="bg-red-800/50 p-4 rounded-lg mb-6">{errorMessage}</div>
	{/if}

	{#if results.length > 0}
		<div id="results-section">
			<h2 class="text-2xl font-semibold mb-4">
				Results for "{search}" (Page {currentPage} of {totalPages})
			</h2>
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
				{#each results as item}
					{#key item.id}
						{#if item.media_type == "tv"}
							<SeriesCard {...item} />
						{:else}
							<MovieCard {...item} />
						{/if}
					{/key}
				{/each}
			</div>

			<div class="text-center text-gray-400 mt-4">
				Showing {results.length} results on this page
			</div>
		</div>
	{:else if !loading && hasSearched}
		<p class="text-center text-gray-400">No results found for "{search}".</p>
	{/if}

	{#if totalPages > 1 && !loading}
		<div class="flex items-center justify-center mt-8 gap-3">
			<button
				onclick={() => changePage(1)}
				disabled={currentPage === 1}
				class="px-3 py-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 text-sm"
			>
				First
			</button>
			<button
				onclick={() => changePage(currentPage - 1)}
				disabled={currentPage === 1}
				class="p-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700"
			>
				<MoveLeft class="w-5 h-5" />
			</button>

			{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
				const startPage = Math.max(1, currentPage - 2);
				const endPage = Math.min(totalPages, startPage + 4);
				return startPage + i;
			}).filter((page) => page <= totalPages) as pageNum}
				<button
					onclick={() => changePage(pageNum)}
					class="px-3 py-2 rounded {currentPage === pageNum
						? 'bg-red-500 text-white'
						: 'bg-gray-800 hover:bg-gray-700'}"
				>
					{pageNum}
				</button>
			{/each}

			<button
				onclick={() => changePage(currentPage + 1)}
				disabled={currentPage === totalPages}
				class="p-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700"
			>
				<MoveRight class="w-5 h-5" />
			</button>
			<button
				onclick={() => changePage(totalPages)}
				disabled={currentPage === totalPages}
				class="px-3 py-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 text-sm"
			>
				Last
			</button>
		</div>
	{/if}
</div>
