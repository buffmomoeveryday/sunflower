<script>
	import MovieCard from '$lib/components/MovieCard.svelte';
	import SeriesCard from '$lib/components/SeriesCard.svelte';
	import { MoveLeft, MoveRight } from 'lucide-svelte';

	let search = $state('');
	let loading = $state(false);
	let movieResults = $state([]);
	let errorMessage = $state('');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let videoType = $state('movie');
	let bollywood = $state(false);

	const searchMovie = async (event, page = 1) => {
		event?.preventDefault();
		loading = true;

		const formData = new FormData();

		formData.append('search', search);
		formData.append('page', page);
		formData.append('videoType', videoType);
		formData.append('bollywood', bollywood | null);

		try {
			const response = await fetch('/api/movie', {
				method: 'POST',
				body: formData
			});
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}
			const json = await response.json();
			if (json.success) {
				movieResults = json.searchResults;
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
			searchMovie(null, newPage);
		}
	};
</script>

<div class="min-h-screen p-4 bg-black">
	<div class="container mx-auto">
		<!-- Search Form -->
		<div class="flex justify-center mb-8">
			<form
				onsubmit={searchMovie}
				class="w-full max-w-2xl px-4 space-y-4 md:space-y-0 md:space-x-4 md:flex md:items-center"
			>
				<input
					type="text"
					bind:value={search}
					name="search"
					placeholder="Search for a {videoType}..."
					required
					class="w-full p-3 text-black bg-white border border-gray-300 rounded-lg md:flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<select
					required
					class="w-full p-3 text-white bg-black border border-gray-300 rounded-lg md:w-32"
					name="videoType"
					bind:value={videoType}
				>
					<option value="tv">Series</option>
					<option value="movie">Movie</option>
				</select>

				<button
					type="submit"
					class="w-full p-3 text-black transition-colors bg-white rounded-lg md:w-auto md:px-6 hover:bg-gray-100"
					disabled={loading}
				>
					<span class="flex items-center justify-center">
						Search
						{#if loading}
							<span
								class="w-5 h-5 ml-2 border-2 border-black rounded-full animate-spin border-t-transparent"
							></span>
						{/if}
					</span>
				</button>
			</form>
		</div>
		<div class="pb-3">
			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="flex items-center justify-center mt-8 space-x-4">
					<MoveLeft
						class="w-6 h-6 text-white cursor-pointer hover:text-gray-400 disabled:cursor-not-allowed"
						onclick={() => changePage(currentPage - 1)}
						disabled={currentPage === 1}
					/>
					<span class="px-4 py-2 text-white rounded-lg">
						Page {currentPage} of {totalPages}
					</span>
					<MoveRight
						class="w-6 h-6 text-white cursor-pointer hover:text-gray-400 disabled:cursor-not-allowed"
						onclick={() => changePage(currentPage + 1)}
						disabled={currentPage === totalPages}
					/>
				</div>
			{/if}
		</div>

		{#if errorMessage}
			<div class="flex justify-center mb-6">
				<span class="p-3 text-white bg-red-600 rounded-lg">{errorMessage}</span>
			</div>
		{/if}

		<div
			class="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			{#each movieResults.filter((movie) => movie.poster_path) as movie}
				<div class="flex justify-center">
					{#if videoType == 'movie'}
						<MovieCard {...movie} />
					{:else}
						<SeriesCard {...movie} />
					{/if}
				</div>
			{/each}
		</div>

		{#if loading}
			<div class="flex justify-center mt-8">
				<p class="text-gray-400">Loading...</p>
			</div>
		{/if}
	</div>
</div>
