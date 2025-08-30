<script>
	import { goto } from "$app/navigation";
	import { Search, MoveLeft, MoveRight } from "lucide-svelte";
	import { tick } from "svelte";

	let search = "";
	let loading = false;
	let results = [];
	let errorMessage = "";
	let currentPage = 1;
	let totalPages = 1;
	let hasSearched = false;

	let sort = "best";
	let filter = "all";
	let debounceTimer;

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

		const formData = new FormData();
		formData.append("search", search.trim());
		formData.append("page", page);
		formData.append("sort", sort);
		formData.append("filter", filter);
		formData.append("per_page", RESULTS_PER_PAGE); // Explicitly request 20 results per page

		try {
			const response = await fetch("/api/tmdbSearch", {
				method: "POST",
				body: formData
			});

			if (!response.ok) throw new Error(`Response status: ${response.status}`);
			const json = await response.json();

			if (json.success) {
				// Filter results based on selected filter
				let filteredResults = json.searchResults.filter(
					(item) =>
						(filter === "all" && (item.media_type === "movie" || item.media_type === "tv")) ||
						(filter === "movies" && item.media_type === "movie") ||
						(filter === "tv" && item.media_type === "tv")
				);

				// Ensure we only show up to RESULTS_PER_PAGE items
				results = filteredResults.slice(0, RESULTS_PER_PAGE);

				// Calculate total pages based on total results and RESULTS_PER_PAGE
				const totalResults = json.total_results || filteredResults.length;
				totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
				currentPage = page;

				// If we have fewer results than expected and we're not on the first page,
				// it might mean we've reached the end
				if (results.length < RESULTS_PER_PAGE && page > 1) {
					totalPages = page;
				}

				if (page === 2) {
					await tick();
					document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
				}
			} else {
				errorMessage = json.error;
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

	// Debounced live search
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

	// Reset pagination when filters change
	const handleFilterChange = (newSort, newFilter) => {
		if (newSort !== undefined) sort = newSort;
		if (newFilter !== undefined) filter = newFilter;
		currentPage = 1;
		searchMovie(1);
	};
</script>

<div class="min-h-screen bg-black text-white p-6">
	<div class="max-w-6xl mx-auto">
		<!-- Search Bar -->
		<div class="flex gap-3 mb-6">
			<input
				type="text"
				bind:value={search}
				on:input={handleInput}
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
				on:click={() => handleFilterChange("best")}>Best Match</button
			>
			<button
				class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {sort === 'newest'
					? 'ring-2 ring-white'
					: ''}"
				on:click={() => handleFilterChange("newest")}>Newest First</button
			>
			<button
				class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {sort === 'oldest'
					? 'ring-2 ring-white'
					: ''}"
				on:click={() => handleFilterChange("oldest")}>Oldest First</button
			>
			<button
				class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {sort === 'rating'
					? 'ring-2 ring-white'
					: ''}"
				on:click={() => handleFilterChange("rating")}>Highest Rated</button
			>

			<span class="ml-6 text-gray-400">Show:</span>
			<button
				class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {filter === 'all'
					? 'ring-2 ring-white'
					: ''}"
				on:click={() => handleFilterChange(undefined, "all")}>All</button
			>
			<button
				class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {filter === 'movies'
					? 'ring-2 ring-white'
					: ''}"
				on:click={() => handleFilterChange(undefined, "movies")}>Movies</button
			>
			<button
				class="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 {filter === 'tv'
					? 'ring-2 ring-white'
					: ''}"
				on:click={() => handleFilterChange(undefined, "tv")}>TV Shows</button
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
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="bg-gray-900 rounded-xl overflow-hidden hover:scale-105 transition transform duration-200"
							on:click={() => {
								if (item.media_type == "tv") {
									goto(`/series/${item.id}`);
								} else {
									goto(`/movie/${item.id}`);
								}
							}}
						>
							<img
								src={item.poster_path
									? `https://image.tmdb.org/t/p/w500${item.poster_path}`
									: "/placeholder.png"}
								alt={item.title || item.name}
								class="w-full h-64 object-cover"
							/>
							<div class="p-3">
								<h3 class="text-lg font-semibold truncate">{item.title || item.name}</h3>
								<p class="text-sm text-gray-400">
									{item.release_date || item.first_air_date || "Unknown date"} • {item.media_type.toUpperCase()}
								</p>
							</div>
						</div>
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
					on:click={() => changePage(1)}
					disabled={currentPage === 1}
					class="px-3 py-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 text-sm"
				>
					First
				</button>
				<button
					on:click={() => changePage(currentPage - 1)}
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
						on:click={() => changePage(pageNum)}
						class="px-3 py-2 rounded {currentPage === pageNum
							? 'bg-red-500 text-white'
							: 'bg-gray-800 hover:bg-gray-700'}"
					>
						{pageNum}
					</button>
				{/each}

				<button
					on:click={() => changePage(currentPage + 1)}
					disabled={currentPage === totalPages}
					class="p-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700"
				>
					<MoveRight class="w-5 h-5" />
				</button>
				<button
					on:click={() => changePage(totalPages)}
					disabled={currentPage === totalPages}
					class="px-3 py-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 text-sm"
				>
					Last
				</button>
			</div>
		{/if}
	</div>
</div>
