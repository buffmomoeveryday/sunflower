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
	import { Trash2, Play, Calendar, Star } from "lucide-svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";

	let activeTab = $state($page.url.searchParams.get("tab") || "movies");

	$effect(() => {
		const tab = $page.url.searchParams.get("tab");
		if (tab && ["movies", "series", "anime"].includes(tab) && tab !== activeTab) {
			activeTab = tab;
		}
	});

	let movies = $state([]);
	let series = $state([]);
	let anime = $state([]);
	let loading = $state(true);

	const currentList = $derived(
		activeTab === "movies" ? movies : activeTab === "series" ? series : anime
	);

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

	function handleCardClick(item) {
		const type = activeTab === "movies" ? "movie" : activeTab === "series" ? "series" : "anime";
		const id = item.tmdb_id || item.id;
		goto(`/${type}/${id}`);
	}
</script>

<div class="min-h-screen text-white p-6">
	<div class="max-w-6xl mx-auto ounded-2xl p-6 shadow-lg">
		<!-- Header -->
		<h2 class="text-3xl font-bold mb-6">My Collection</h2>

		<!-- Tabs -->
		<div class="flex space-x-6 border-b border-gray-700 mb-6">
			{#each ["movies", "series", "anime"] as tab}
				<button
					class="relative pb-3 px-4 font-medium text-gray-400 hover:text-white transition-colors"
					class:text-pink-400={activeTab === tab}
					onclick={() => {
						activeTab = tab;
						const url = new URL($page.url);
						url.searchParams.set("tab", tab);
						goto(url, { replaceState: true, noScroll: true, keepFocus: true });
					}}
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
			<div class="flex items-center justify-center py-20">
				<div
					class="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"
				></div>
			</div>
		{:else if currentList.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="bg-gray-900/50 p-6 rounded-full mb-4">
					<Play class="w-12 h-12 text-gray-700" />
				</div>
				<p class="text-xl font-bold text-gray-400">Your {activeTab} collection is empty</p>
				<p class="text-gray-600 mt-2">Start watching to build your history.</p>
			</div>
		{:else}
			<div
				class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
			>
				{#each currentList as item (item.id)}
					<div
						class="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 transition-all duration-300 hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10 active:scale-95"
					>
						<!-- Poster Image -->
						<button
							onclick={() => handleCardClick(item)}
							class="relative w-full aspect-[2/3] overflow-hidden block"
						>
							<img
								src={item.poster_path
									? `https://image.tmdb.org/t/p/w500${item.poster_path}`
									: item.poster || "/placeholder.jpg"}
								alt={item.title || item.name}
								class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"
							></div>

							<!-- Rating Badge -->
							{#if item.vote_average || item.vote}
								<div
									class="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10"
								>
									<Star class="w-3 h-3 text-yellow-500 fill-yellow-500" />
									<span class="text-[10px] font-bold"
										>{(item.vote_average || item.vote || 0).toFixed(1)}</span
									>
								</div>
							{/if}
						</button>

						<!-- Floating Delete Button -->
						<button
							class="absolute top-2 left-2 p-2 bg-black/60 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 border border-white/10"
							onclick={(e) => {
								e.stopPropagation();
								removeItem(activeTab, item.id);
							}}
							title="Remove from history"
						>
							<Trash2 class="w-4 h-4" />
						</button>

						<!-- Info Section -->
						<div class="p-3">
							<h3
								class="text-sm font-bold text-white line-clamp-1 mb-1 group-hover:text-pink-400 transition-colors"
							>
								{item.title || item.name}
							</h3>

							<div class="flex items-center justify-between">
								<div
									class="flex items-center gap-1 text-[10px] text-gray-500 font-medium uppercase tracking-wider"
								>
									<Calendar class="w-3 h-3" />
									<span
										>{(item.release_date || item.first_air_date || item.start_date || "").split(
											"-"
										)[0]}</span
									>
								</div>
								<span
									class="text-[9px] px-2 py-0.5 bg-gray-800 rounded-full text-gray-400 border border-gray-700 italic"
								>
									{#if activeTab === 'series' && item.season_id}
										S{item.season_id} E{item.episode_id}
									{:else}
										{activeTab === "movies" ? "Movie" : activeTab === "series" ? "Series" : "Anime"}
									{/if}
								</span>
							</div>
						</div>

						<!-- Quick Play Overlay on Hover (Center) -->
						<div
							class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
						>
							<div class="bg-pink-600 p-4 rounded-full shadow-xl shadow-pink-500/40">
								<Play class="w-6 h-6 text-white fill-white" />
							</div>
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
