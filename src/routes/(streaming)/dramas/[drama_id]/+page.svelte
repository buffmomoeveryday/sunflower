<script>
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { toggleSeriesBookmark, addToSeriesHistory } from "$lib/remote/bookmarks.remote.js";
	import { isSeriesBookmarkedLocal, addBookmarkLocal, removeBookmarkLocal } from "$lib/state/bookmarks.svelte.js";
	import { get } from "svelte/store";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { getEpisodes } from "$lib/remote/series.remote";
	import { createProgressSync } from "$lib/player/watchProgress.js";
	import {
		Heart,
		ChevronLeft,
		ChevronRight,
		Play,
		Calendar,
		Star,
		Users,
		Clock,
		Info,
		Menu,
		X
	} from 'lucide-svelte';
	let { data } = $props();
	let seriesDetailData = data.seriesDetailData;
	let user = data?.user;

	let iframeEl = $state();
	const progressSync = createProgressSync({
		type: "series",
		getMeta: () => ({
			tmdbId: seriesDetailData.id,
			seasonId: selectedSeason,
			episodeId: selectedEpisode,
			serverId: selectedSource + 1
		}),
		isEnabled: () => !!user
	});

	function readPlaybackQuery(sp) {
		const s = parseInt(sp.get("season") ?? "", 10);
		const e = parseInt(sp.get("episode") ?? "", 10);
		const sv = parseInt(sp.get("server_id") ?? "", 10);
		return {
			season: !isNaN(s) && s > 0 ? s : 1,
			episode: !isNaN(e) && e > 0 ? e : 1,
			source: !isNaN(sv) && sv > 0 ? Math.max(0, sv - 1) : 0
		};
	}

	const initialPb = readPlaybackQuery(get(page).url.searchParams);

	let selectedSource = $state(initialPb.source);
	let selectedSeason = $state(initialPb.season);
	let episodes = $state([]);
	let selectedEpisode = $state(initialPb.episode);
	let isSidebarVisible = $state(false); // Start hidden on mobile
	let isPlayerLoading = $state(true); // Track loading state

	let isBookmarked = $derived(isSeriesBookmarkedLocal(seriesDetailData.id));


	// Derived State
	let iframeSources = $derived([
		`https://vidsrc.cc/v2/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://vidsrc.icu/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://embed.su/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://player.videasy.net/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://player.autoembed.cc/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://111movies.com/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`, //no
		`https://vidjoy.pro/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://mappletv.uk/watch/tv/${seriesDetailData.id}-${selectedSeason}-${selectedEpisode}`, //supports events
		`https://vidfast.pro/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}?autoPlay=true`, //supports events
		`https://vidlink.pro/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`, //supports events
		`https://embed.rgshows.me/api/2/tv/?id=${seriesDetailData.id}&s=${selectedSeason}&e=${selectedSeason}`,
		`https://embed.rgshows.me/api/3/tv/?id=${seriesDetailData.id}&s=${selectedSeason}&e=${selectedEpisode}`,
		// `https://drama.autoembed.cc/embed/kissed-by-the-rain-2024-episode-11`
	]);

	let isNextEpisodeAvailable = $derived(() => {
		const currentEpisodeIndex = selectedEpisode - 1;
		if (currentEpisodeIndex + 1 < episodes.length) {
			const nextEpisode = episodes[currentEpisodeIndex + 1];
			return new Date(nextEpisode.air_date) <= new Date();
		} else {
			return selectedSeason < seriesDetailData.seasons.length;
		}
	});

	const isDisabled = $derived.by(() => {
		!isNextEpisodeAvailable ||
			(selectedSeason >= seriesDetailData.seasons.length && selectedEpisode >= episodes.length);
	});

	async function updateProgressInDatabase() {
		if (!user) return;
		try {
			await addToSeriesHistory({
				tmdb_id: seriesDetailData.id,
				poster_path: seriesDetailData.poster_path,
				name: seriesDetailData.name,
				vote_average: seriesDetailData.vote_average,
				first_air_date: seriesDetailData.first_air_date,
				number_of_seasons: seriesDetailData.number_of_seasons,
				season_id: selectedSeason,
				episode_id: selectedEpisode,
				server_id: selectedSource + 1
			});
		} catch (error) {
			console.error("Error updating progress:", error);
		}
	}

	async function toggleBookmark() {
		if (!user) {
			toast.error("Please login to bookmark");
			return;
		}
		try {
			const result = await toggleSeriesBookmark({
				tmdb_id: seriesDetailData.id,
				poster_path: seriesDetailData.poster_path,
				name: seriesDetailData.name,
				vote_average: seriesDetailData.vote_average,
				first_air_date: seriesDetailData.first_air_date,
				number_of_seasons: seriesDetailData.number_of_seasons
			});

			if (result.success) {
				if (result.action === "added") {
					addBookmarkLocal("series", seriesDetailData.id);
					toast.success("Added to bookmark");
				} else {
					removeBookmarkLocal("series", seriesDetailData.id);
					toast.success("Removed from bookmark");
				}
			} else {
				toast.error(result.error || "Failed to toggle bookmark");
			}
		} catch (e) {
			console.error("Bookmark error:", e);
		}
	}

	async function fetchEpisodes(seasonNumber) {
		selectedSeason = seasonNumber;
		let result = await getEpisodes({
			tvId: seriesDetailData.id.toString(),
			seasonNumber: seasonNumber.toString()
		});
		episodes = result.episodes;
		await updateProgressInDatabase();
	}
	async function selectEpisode(episodeId) {
		selectedEpisode = episodeId;
		isPlayerLoading = true; // Set loading state when changing episodes
		progressSync.reset();
		await updateProgressInDatabase();
	}
	async function changeSource(index) {
		selectedSource = index;
		isPlayerLoading = true;
		const url = new URL(get(page).url);
		url.searchParams.set("season", selectedSeason.toString());
		url.searchParams.set("episode", selectedEpisode.toString());
		url.searchParams.set("server_id", (index + 1).toString());
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
		progressSync.scheduleSeek(() => iframeEl, progressSync.getPosition());
		await updateProgressInDatabase();
	}
	function handleIframeLoad() {
		isPlayerLoading = false; // Remove loading state when iframe loads
	}
	async function getProgress() {
		await progressSync.loadAndSeek(() => iframeEl);
	}
	function previousEpisode() {
		if (selectedEpisode > 1) {
			selectEpisode(selectedEpisode - 1);
		} else if (selectedSeason > 1) {
			selectedSeason--;
			fetchEpisodes(selectedSeason).then(() => {
				selectEpisode(episodes.length);
			});
		}
	}
	// Update the nextEpisode function to check air dates
	function nextEpisode() {
		if (selectedEpisode < episodes.length) {
			const nextEpisodeData = episodes[selectedEpisode]; // selectedEpisode is 1-based
			if (new Date(nextEpisodeData.air_date) <= new Date()) {
				selectEpisode(selectedEpisode + 1);
			}
		} else if (selectedSeason < seriesDetailData.seasons.length) {
			selectedSeason++;
			fetchEpisodes(selectedSeason).then(() => {
				// Check if first episode of new season is available
				if (episodes.length > 0 && new Date(episodes[0].air_date) <= new Date()) {
					selectEpisode(1);
				}
			});
		}
	}
	function toggleSidebar() {
		isSidebarVisible = !isSidebarVisible;
	}

	onMount(async () => {
		await fetchEpisodes(selectedSeason);

		if (user) {
			await updateProgressInDatabase();
		}
		await getProgress();
	});

	onMount(() => {
		progressSync.start();
		return () => progressSync.stop();
	});
</script>

<div
	class="flex flex-col min-h-0 text-white bg-black"
>
	<!-- Mobile Header -->
	<div class="flex items-center justify-between p-4 bg-black border-b border-gray-800 md:hidden">
		<button
			onclick={toggleSidebar}
			class="p-2 text-white transition-colors duration-200 hover:text-gray-300"
		>
			{#if isSidebarVisible}
				<X size={24} />
			{:else}
				<Menu size={24} />
			{/if}
		</button>
		<h1 class="text-lg font-bold truncate">
			{seriesDetailData.name}
		</h1>
		{#if user}
			<button
				onclick={toggleBookmark}
				class="p-2 transition-colors duration-200 hover:bg-gray-800 rounded-lg"
			>
				<Heart
					size={20}
					color={isBookmarked ? '#fb2c36' : 'white'}
					fill={isBookmarked ? '#fb2c36' : 'none'}
				/>
			</button>
		{/if}
	</div>
	<div class="flex flex-1 min-h-0 overflow-hidden">
		<!-- Sidebar -->
		<div
			class={`
            fixed inset-y-0 left-0 z-50 w-80 bg-black border-r border-gray-800 transform transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0 md:w-1/4 lg:w-1/5 md:h-full
            ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
		>
			<div class="flex flex-col h-full">
				<!-- Sidebar Header -->
				<div class="flex items-center justify-between p-4 border-b border-gray-800 md:hidden">
					<h2 class="text-lg font-bold">Episodes</h2>
					<button
						onclick={toggleSidebar}
						class="p-1 text-white transition-colors duration-200 hover:text-gray-300"
					>
						<X size={20} />
					</button>
				</div>
				<div class="flex-1 p-4 overflow-y-auto">
					<!-- Desktop Watchlist Button -->
					{#if user}
						<button
							class="hidden md:flex items-center gap-2 w-full p-3 mb-6 transition-colors duration-200 bg-black border border-gray-700 rounded-lg hover:bg-gray-800"
							onclick={toggleBookmark}
						>
							<Heart
								size={20}
								color={isBookmarked ? '#fb2c36' : 'white'}
								fill={isBookmarked ? '#fb2c36' : 'none'}
							/>
							<span class="text-sm">{isBookmarked ? 'Added to Home' : 'Add to Home'}</span>
						</button>
					{/if}
					<!-- Season Selection -->
					<div class="mb-6">
						<h3
							class="flex items-center gap-2 mb-3 text-sm font-bold text-white uppercase tracking-wide"
						>
							<Play size={16} />
							Seasons
						</h3>
						<select
							bind:value={selectedSeason}
							onchange={() => fetchEpisodes(selectedSeason)}
							class="w-full p-3 text-white bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{#each seriesDetailData.seasons as season}
								<option value={season.season_number}>
									Season {season.season_number}
								</option>
							{/each}
						</select>
					</div>
					<!-- Episodes List -->
					<div class="mb-4">
						<h3
							class="flex items-center gap-2 mb-3 text-sm font-bold text-white uppercase tracking-wide"
						>
							<Clock size={16} />
							Episodes
						</h3>
						<!-- Applied no-scrollbar class here -->
						<div class="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
							{#each episodes as episode, index}
								<button
									disabled={new Date(episode.air_date) > new Date()}
									onclick={() => selectEpisode(index + 1)}
									class={`w-full p-2.5 text-left transition-all duration-200 rounded-lg border flex items-center gap-3 ${
										selectedEpisode === index + 1
											? 'bg-white text-black border-white'
											: new Date(episode.air_date) > new Date()
												? 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed'
												: 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600'
									}`}
									title={new Date(episode.air_date) > new Date()
										? 'This episode is not live yet!'
										: episode.name}
								>
									{#if episode.still_path}
										<img
											src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
											alt={`Episode ${episode.episode_number} Still`}
											class="w-20 shrink-0 rounded object-cover aspect-video"
										/>
									{:else}
										<div
											class="w-20 shrink-0 aspect-video rounded bg-gray-700 flex items-center justify-center"
										>
											<span class="text-[10px] text-gray-400">No Image</span>
										</div>
									{/if}
									<!-- Episode Details -->
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-1.5 text-[11px] whitespace-nowrap opacity-70">
											<span class="shrink-0 font-semibold">Ep {episode.episode_number}</span>
											<span class="shrink-0">&#8226;</span>
											<span class="truncate">{episode.air_date}</span>
										</div>
										<div class="mt-0.5 text-sm font-medium leading-snug line-clamp-2">
											{episode.name}
										</div>
									</div>
									{#if selectedEpisode === index + 1}
										<Play size={16} class="shrink-0" />
									{/if}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- Main Content -->
		<div class="flex-1 flex flex-col min-h-0 overflow-y-auto md:w-3/4 lg:w-4/5">
			<div class="flex flex-col min-h-0 p-4 md:p-6 shrink-0">
				<div class="mb-3 flex-shrink-0">
					<h2 class="text-xl md:text-2xl font-bold text-white mb-1">
						{seriesDetailData.name}
					</h2>
					<div class="flex items-center gap-2 text-sm text-gray-400">
						<span>Season {selectedSeason}</span>
						<span>•</span>
						<span>Episode {selectedEpisode}</span>
						{#if episodes[selectedEpisode - 1]}
							<span>•</span>
							<span>{episodes[selectedEpisode - 1].name}</span>
						{/if}
					</div>
				</div>

				<div
					class="series-player-frame relative rounded-lg overflow-hidden bg-black border-2 border-gray-700 shadow-lg"
				>
					{#key `${selectedSource}-${selectedSeason}-${selectedEpisode}`}
						{#if isPlayerLoading}
							<div class="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
								<div class="flex flex-col items-center gap-4">
									<div
										class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
									></div>
									<p class="text-gray-400">Loading episode...</p>
								</div>
							</div>
						{/if}
						<iframe
							bind:this={iframeEl}
							src={iframeSources[selectedSource]}
							class="absolute inset-0 block h-full w-full min-h-0 min-w-0 border-0"
							allowfullscreen
							loading="lazy"
							title="Series Player"
							onload={handleIframeLoad}
							scrolling="no"
						></iframe>
					{/key}
				</div>

				<div
					class="relative z-10 mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg flex-shrink-0"
				>
					<div class="flex items-center justify-center sm:justify-start gap-2 shrink-0">
						<button
							onclick={previousEpisode}
							disabled={selectedSeason === 1 && selectedEpisode === 1}
							class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronLeft size={16} />
							<span class="hidden sm:inline">Previous</span>
						</button>
						<button
							onclick={nextEpisode}
							disabled={isDisabled}
							class={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow transition-colors ${
								isDisabled
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "text-gray-700 bg-gray-200 hover:bg-gray-300"
							}`}
						>
							<span class="hidden sm:inline">Next</span>
							<ChevronRight size={16} />
						</button>
					</div>

					<div
						class="flex items-center gap-2 min-w-0 w-full sm:w-auto sm:flex-1 sm:justify-end sm:max-w-[min(100%,42rem)] lg:max-w-none"
					>
						<span class="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0"
							>Server</span
						>
						<div
							class="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 min-w-0 flex-1 sm:flex-initial sm:justify-end"
						>
							{#each iframeSources as _, index}
								<button
									type="button"
									class={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors min-w-[2rem] ${
										index === selectedSource
											? "bg-white text-black shadow"
											: "bg-gray-700 text-white hover:bg-gray-600"
									}`}
									onclick={() => changeSource(index)}
								>
									{index + 1}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
			<!-- Series Information - Scrollable -->
			<!-- Applied no-scrollbar class here -->
			<div class="p-4 md:p-6 space-y-6 overflow-y-auto flex-shrink-0 max-h-64 no-scrollbar">
				<!-- Series Details -->
				<div class="p-6 bg-gray-900 rounded-lg">
					<h3 class="flex items-center gap-2 mb-4 text-xl font-bold">
						<Info size={20} />
						About {seriesDetailData.name}
					</h3>
					<p class="text-gray-300 mb-6 leading-relaxed">{seriesDetailData.overview}</p>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div>
							<h4
								class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Star size={14} />
								Rating
							</h4>
							<div class="flex items-center gap-2">
								<Star size={16} class="text-yellow-500" fill="currentColor" />
								<span class="text-white font-medium"
									>{seriesDetailData.vote_average.toFixed(1)}</span
								>
								<span class="text-gray-400">/ 10</span>
							</div>
						</div>
						<div>
							<h4
								class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Calendar size={14} />
								First Air Date
							</h4>
							<p class="text-white">{seriesDetailData.first_air_date}</p>
						</div>
						<div>
							<h4
								class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Users size={14} />
								Status
							</h4>
							<p class="text-white">{seriesDetailData.status}</p>
						</div>
					</div>
					<div class="mt-6">
						<h4 class="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">Genres</h4>
						<div class="flex flex-wrap gap-2">
							{#each seriesDetailData.genres as genre}
								<span
									class="px-3 py-1 text-sm bg-gray-800 border border-gray-700 rounded-full text-gray-300"
								>
									{genre.name}
								</span>
							{/each}
						</div>
					</div>
				</div>
				<!-- Current Episode Details -->
				{#if episodes[selectedEpisode - 1]}
					<div class="p-6 bg-gray-900 rounded-lg">
						<h3 class="flex items-center gap-2 mb-4 text-xl font-bold">
							<Play size={20} />
							Current Episode
						</h3>
						<h4 class="text-lg font-semibold mb-2">{episodes[selectedEpisode - 1].name}</h4>
						<p class="text-gray-300 mb-4 leading-relaxed">
							{episodes[selectedEpisode - 1].overview}
						</p>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<h4
									class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide"
								>
									<Calendar size={14} />
									Air Date
								</h4>
								<p class="text-white">{episodes[selectedEpisode - 1].air_date}</p>
							</div>
							<div>
								<h4
									class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide"
								>
									<Star size={14} />
									Episode Rating
								</h4>
								<div class="flex items-center gap-2">
									<Star size={16} class="text-yellow-500" fill="currentColor" />
									<span class="text-white font-medium"
										>{episodes[selectedEpisode - 1].vote_average.toFixed(1)}</span
									>
									<span class="text-gray-400">/ 10</span>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
<!-- Sidebar Overlay for Mobile -->
{#if isSidebarVisible}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="button"
		tabindex="0"
		class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
		onclick={toggleSidebar}
	></div>
{/if}

<style>
	.series-player-frame {
		box-sizing: border-box;
		width: 100%;
		max-width: 100%;
		aspect-ratio: 16 / 9;
		max-height: min(52vh, calc(100dvh - 15rem));
		margin-inline: auto;
	}
	@media (min-width: 1024px) {
		.series-player-frame {
			max-height: min(62vh, calc(100dvh - 10rem));
		}
	}

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
