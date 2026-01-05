<script>
	import { onMount } from "svelte";
	import { 
		getMoviesHistory, 
		getSeriesHistory, 
		getAnimeHistory, 
		removeMovieHistory, 
		removeSeriesHistory, 
		removeAnimeHistory 
	} from "$lib/remote/bookmarks.remote.js";
	import MovieCard from "$lib/components/card/MovieCard.svelte";

	let activeTab = $state("movies"); // 'movies' | 'series' | 'anime'

	let movies = $state([]);
	let series = $state([]);
	let anime = $state([]);
	let loading = $state(true);

	async function loadAll() {
		loading = true;
		try {
			movies = await getMoviesHistory();
			series = await getSeriesHistory();
			anime = await getAnimeHistory();
		} catch (error) {
			console.error("Failed to load history:", error);
		} finally {
			loading = false;
		}
	}

	async function removeItem(type, id) {
		try {
			if (type === "movies") {
				await removeMovieHistory(id);
			} else if (type === "series") {
				await removeSeriesHistory(id);
			} else if (type === "anime") {
				await removeAnimeHistory(id);
			}
			await loadAll();
		} catch (error) {
			console.error("Failed to remove item:", error);
		}
	}

	onMount(async () => {
		await loadAll();
	});
</script>


<div class="min-h-screen bg-black text-white p-6">
	<div class="max-w-6xl mx-auto bg-black rounded-2xl p-6 shadow-lg">
		<!-- Header -->
		<h2 class="text-3xl font-bold mb-6">My Collection</h2>

		<!-- Tabs -->
		<div class="flex space-x-6 border-b border-gray-700 mb-6">
			{#each ["movies", "series", "anime"] as tab}
				<button
					class="relative pb-3 px-4 font-medium text-gray-400 hover:text-white transition-colors"
					class:text-pink-400={activeTab === tab}
					onclick={() => (activeTab = tab)}

				>
					{tab.charAt(0).toUpperCase() + tab.slice(1)}
					<span
						class="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500 transition-opacity duration-300"
						class:opacity-100={activeTab === tab}
						class:opacity-0={activeTab !== tab}
					></span>
				</button>
			{/each}
		</div>

		<!-- Content -->
		{#if loading}
			<p class="text-gray-400">Loading {activeTab}...</p>
		{:else if activeTab === "movies" && movies.length === 0}
			<p class="text-gray-500">No movies found.</p>
		{:else if activeTab === "series" && series.length === 0}
			<p class="text-gray-500">No series found.</p>
		{:else if activeTab === "anime" && anime.length === 0}
			<p class="text-gray-500">No anime found.</p>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
				{#each activeTab === "movies" ? movies : activeTab === "series" ? series : anime as item}
					<div class="bg-gray-800 rounded-xl shadow p-3 hover:shadow-lg transition flex flex-col">
						<MovieCard {...item} />
						<div class="mt-2 flex justify-end">
							<button
								class="text-xs text-white bg-pink-500 hover:bg-pink-600 px-3 py-1.5 rounded-lg transition-colors"
								onclick={() => removeItem(activeTab, item.id)}

							>
								Remove
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Smooth fade when switching tabs */
	.grid {
		animation: fadeIn 0.3s ease-in-out;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
