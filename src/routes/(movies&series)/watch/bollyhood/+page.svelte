<script>
	import BollyhoodCard from '$lib/components/BollyhoodCard.svelte';

	// Props and state declarations
	let { data } = $props();

	let bolyhoodData = $state({
		results: data.bolyhoodData.results,
		total_pages: data.bolyhoodData.total_pages,
		current_page: 1
	});
	let isLoading = $state(false);

	// Fetch new results
	async function fetchMoviesByPage(page) {
		isLoading = true;
		try {
			const response = await fetch('/api/movie/bolywood', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ page })
			});

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					// Update state with new results
					bolyhoodData = {
						results: [...bolyhoodData.results, ...result.results],
						current_page: result.current_page,
						total_pages: result.total_pages
					};
				}
			} else {
				console.error('Failed to fetch movies');
			}
		} catch (error) {
			console.error('Error fetching movies:', error);
		} finally {
			isLoading = false;
		}
	}

	// Load the next page on button click
	async function loadNextPage() {
		if (bolyhoodData.current_page < bolyhoodData.total_pages && !isLoading) {
			await fetchMoviesByPage(bolyhoodData.current_page + 1);
		}
	}
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<section class="container p-4 mx-auto mt-6 rounded-lg">
		<h2 class="text-xl font-bold md:text-2xl">Popular Bollywood Movies</h2>
		{#if bolyhoodData.results?.length}
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
			>
				{#each bolyhoodData.results as movie (movie.id)}
					<BollyhoodCard {...movie} />
				{/each}
			</div>

			{#if isLoading}
				<p class="mt-4 text-center">Loading more movies...</p>
			{/if}

			{#if bolyhoodData.current_page < bolyhoodData.total_pages}
				<div class="flex justify-center">
					<button
						class="px-4 py-2 mt-4 text-sm font-bold text-black bg-white rounded hover:bg-gray-200"
						onclick={loadNextPage}
						disabled={isLoading}
					>
						Load More...
					</button>
				</div>
			{/if}
		{:else}
			<p class="text-center">No movies found.</p>
		{/if}
	</section>
</div>
