<script>
	import SeriesCard from '$lib/components/SeriesCard.svelte';

	let search = $state('');
	let loading = $state(false);
	let seriesResults = $state([]);
	let errorMessage = $state('');
	let currentPage = $state(1);
	let totalPages = $state(1);

	const searchSeries = async (event, page = 1) => {
		event?.preventDefault(); // Prevent form submission reload

		loading = true;

		const formData = new FormData();
		formData.append('search', search);
		formData.append('page', page);

		try {
			const response = await fetch('/api/series', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}

			const json = await response.json();
			if (json.success) {
				seriesResults = json.searchResults;
				totalPages = json.total_pages;
				currentPage = json.current_page;
			} else {
				errorMessage = json.error;
			}
		} catch (error) {
			errorMessage = 'Failed to fetch search results.';
			console.error(error);
		} finally {
			loading = false;
		}
	};

	const changePage = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages) {
			searchSeries(null, newPage);
		}
	};
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-4 text-white bg-black">
	<!-- Search Form -->
	<form onsubmit={searchSeries} class="flex flex-col w-full gap-4 mb-6 sm:flex-row sm:max-w-md">
		<input
			type="text"
			bind:value={search}
			name="search"
			placeholder="Search for a series..."
			required
			class="flex-grow p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button
			type="submit"
			class="flex items-center justify-center p-3 text-black bg-white rounded-lg"
			disabled={loading}
		>
			Search
			{#if loading}
				<span
					class="w-5 h-5 pl-1 border-2 border-black rounded-full animate-spin border-t-transparent"
				></span>
			{/if}
		</button>
	</form>
	{#if errorMessage}
		<span class="p-3 text-white bg-red-600">{errorMessage}</span>
	{/if}

	<!-- Movie Results -->
	<div
		class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
	>
		{#each seriesResults.filter((movie) => movie.poster_path) as movie}
			<SeriesCard {...movie} class="" />
		{/each}
	</div>

	{#if loading}
		<p class="mt-4 text-center text-gray-400">Loading...</p>
	{/if}
</div>
