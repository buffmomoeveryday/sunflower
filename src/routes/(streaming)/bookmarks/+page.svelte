<script>
	import MovieCard from "$lib/components/card/MovieCard.svelte";
	import SeriesCard from "$lib/components/card/SeriesCard.svelte";
	import AnimeCard from "$lib/components/card/AnimeCard.svelte";
	import { PersistedState } from "runed";
	import { toast } from "svelte-sonner";

	import { db } from "$lib/dexie.js";
	import { onMount } from "svelte";

	const activeTab = new PersistedState("bookmarks", "movie");

	let bookmarkedMovies = $state([]);
	let bookmarkedSeries = $state([]);
	let bookmarkedAnime = $state([]);

	onMount(async () => {
		bookmarkedMovies = await db.movies_bookmark.toArray();
		bookmarkedSeries = await db.series_bookmark.toArray();
		bookmarkedAnime = await db.animes_bookmark.toArray();
	});
	function setActiveTab(tab) {
		activeTab.current = tab;
	}
</script>

<div class="min-h-screen bg-black text-white p-6">
	<div class="container mx-auto max-w-6xl bg-black rounded-2xl p-6 shadow-lg">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-white mb-2">My Bookmarks</h1>
			<p class="text-gray-400">Manage your saved movies, series, and anime</p>
		</div>

		<!-- Tab Navigation -->
		<div class="flex border-b border-gray-700 mb-6 space-x-2">
			<button
				class="px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200
				{activeTab.current === 'movie'
					? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800'
					: 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}"
				onclick={() => setActiveTab("movie")}
			>
				🎬 Movies
			</button>
			<button
				class="px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200
				{activeTab.current === 'series'
					? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800'
					: 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}"
				onclick={() => setActiveTab("series")}
			>
				📺 Series
			</button>
			<button
				class="px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200
				{activeTab.current === 'anime'
					? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800'
					: 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}"
				onclick={() => setActiveTab("anime")}
			>
				🎌 Anime
			</button>
		</div>

		<!-- Tab Content -->
		<div class="min-h-[24rem]">
			{#if activeTab.current === "movie"}
				<div class="tab-content">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-xl font-semibold text-white">Bookmarked Movies</h2>
						<span class="text-sm text-gray-400">{bookmarkedMovies.length} items</span>
					</div>

					<!-- Movies -->
					{#if bookmarkedMovies.length > 0}
						<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
							{#each bookmarkedMovies as movie}
								<MovieCard {...movie} class="h-full" />
							{/each}
						</div>
					{:else}
						<div class="text-center py-16">
							<div class="text-6xl mb-4">🎬</div>
							<p class="text-gray-300 text-lg mb-2">No bookmarked movies yet</p>
							<p class="text-gray-500 text-sm">
								Start exploring and bookmark your favorite movies!
							</p>
						</div>
					{/if}
				</div>
			{:else if activeTab.current === "series"}
				<div class="tab-content">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-xl font-semibold text-white">Bookmarked Series</h2>
						<span class="text-sm text-gray-400">{bookmarkedSeries.length} items</span>
					</div>
					<!-- Series -->
					{#if bookmarkedSeries.length > 0}
						<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
							{#each bookmarkedSeries as series}
								<SeriesCard {...series} class="h-full" />
							{/each}
						</div>
					{:else}
						<div class="text-center py-16">
							<div class="text-6xl mb-4">📺</div>
							<p class="text-gray-300 text-lg mb-2">No bookmarked series yet</p>
							<p class="text-gray-500 text-sm">
								Start exploring and bookmark your favorite series!
							</p>
						</div>
					{/if}
				</div>
			{:else}
				<div class="tab-content">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-xl font-semibold text-white">Bookmarked Anime</h2>
						<span class="text-sm text-gray-400">{bookmarkedAnime.length} items</span>
					</div>
					<!-- Anime -->
					{#if bookmarkedAnime.length > 0}
						<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
							{#each bookmarkedAnime as anime}
								<div
									class="bg-gray-800 rounded-lg shadow p-3 hover:shadow-lg transition duration-200 text-center"
								>
									<AnimeCard {...anime} />
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-16">
							<div class="text-6xl mb-4">🎌</div>
							<p class="text-gray-300 text-lg mb-2">No bookmarked anime yet</p>
							<p class="text-gray-500 text-sm">Start exploring and bookmark your favorite anime!</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.tab-content {
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
