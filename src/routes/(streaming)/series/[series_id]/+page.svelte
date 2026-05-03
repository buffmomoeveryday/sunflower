<script>
	import { toggleSeriesBookmark, addToSeriesHistory } from "$lib/remote/bookmarks.remote.js";
	import {
		isSeriesBookmarkedLocal,
		addBookmarkLocal,
		removeBookmarkLocal
	} from "$lib/state/bookmarks.svelte.js";
	import { onMount } from "svelte";

	import { toast } from "svelte-sonner";

	import { page } from "$app/stores";
	import { get } from "svelte/store";
	import { goto } from "$app/navigation";
	import { PersistedState } from "runed";
	import { getEpisodes } from "$lib/remote/series.remote";
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
		X,
		SearchSlashIcon,
		Bookmark
	} from "lucide-svelte";

	let { data } = $props();
	let seriesDetailData = data.seriesDetailData;
	let user = data?.user;

	let selectedSource = $state(0);
	let selectedSeason = $state(1);
	let selectedEpisode = $state(1);

	let isInitialLoad = $state(true);

	$effect(() => {
		const s = parseInt($page.url.searchParams.get("season") || "");
		const e = parseInt($page.url.searchParams.get("episode") || "");
		const sv = parseInt($page.url.searchParams.get("server_id") || "");

		if (isInitialLoad) {
			if (!isNaN(s) && s !== selectedSeason) {
				selectedSeason = s;
				fetchEpisodes(s);
			}
			if (!isNaN(e) && e !== selectedEpisode) {
				selectedEpisode = e;
			}
			if (!isNaN(sv) && sv - 1 !== selectedSource) {
				selectedSource = Math.max(0, sv - 1);
			}
			isInitialLoad = false;
		} else {
			// Sync state to URL if URL doesn't match
			if (s !== selectedSeason || e !== selectedEpisode || sv - 1 !== selectedSource) {
				const url = new URL($page.url);
				url.searchParams.set("season", selectedSeason.toString());
				url.searchParams.set("episode", selectedEpisode.toString());
				url.searchParams.set("server_id", (selectedSource + 1).toString());
				goto(url, { replaceState: true, keepFocus: true, noScroll: true });
			}
		}
	});

	let episodes = $state([]);
	let isBookmarked = $derived(isSeriesBookmarkedLocal(seriesDetailData.id));

	let isSidebarVisible = $state(false);
	let isPlayerLoading = $state(true);

	let iframeSources = $derived([
		`https://vidsrc.icu/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://embed.su/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://player.autoembed.cc/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://111movies.com/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://vidjoy.pro/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://embed.rgshows.me/api/2/tv/?id=${seriesDetailData.id}&s=${selectedSeason}&e=${selectedEpisode}`,
		`https://embed.rgshows.me/api/3/tv/?id=${seriesDetailData.id}&s=${selectedSeason}&e=${selectedEpisode}`,
		`https://player.videasy.net/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://mappletv.uk/watch/tv/${seriesDetailData.id}-${selectedSeason}-${selectedEpisode}`,
		`https://vidfast.pro/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}?autoPlay=true`,
		`https://vidlink.pro/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`
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

	let isDisabled = $derived.by(() => {
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

	async function fetchEpisodes(seasonNumber) {
		selectedSeason = seasonNumber;
		let result = await getEpisodes({
			tvId: seriesDetailData.id.toString(),
			seasonNumber: seasonNumber.toString()
		});
		episodes = result.episodes;
	}

	async function selectEpisode(episodeId) {
		selectedEpisode = episodeId;
		isPlayerLoading = true;
		await updateProgressInDatabase();
	}

	function saveProgressAndSelectedSource() {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				season: selectedSeason.current,
				episode: selectedEpisode.current,
				source: selectedSource.current
			})
		);
	}

	async function changeSource(index) {
		selectedSource = index;
		isPlayerLoading = true;
		const url = new URL(get(page).url);
		url.searchParams.set("season", selectedSeason.toString());
		url.searchParams.set("episode", selectedEpisode.toString());
		url.searchParams.set("server_id", (index + 1).toString());
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
		await updateProgressInDatabase();
	}

	function handleIframeLoad() {
		isPlayerLoading = false;
	}

	async function getProgress() {}

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

	function nextEpisode() {
		if (selectedEpisode < episodes.length) {
			const nextEpisodeData = episodes[selectedEpisode]; // selectedEpisode is 1-based
			if (new Date(nextEpisodeData.air_date) <= new Date()) {
				selectEpisode(selectedEpisode + 1);
			}
		} else if (selectedSeason < seriesDetailData.seasons.length) {
			selectedSeason++;
			fetchEpisodes(selectedSeason).then(() => {
				if (episodes.length > 0 && new Date(episodes[0].air_date) <= new Date()) {
					selectEpisode(1);
				}
			});
		}
	}

	function toggleSidebar() {
		isSidebarVisible = !isSidebarVisible;
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
	onMount(async () => {
		await fetchEpisodes(selectedSeason);

		await getProgress();

		if (user) {
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
				console.error("Error adding to watch history:", error);
			}
		}
	});
</script>

<svelte:window
	on:message={() => {
		if (data.type === "PLAYER_EVENT") {
			const { event, currentTime, duration } = data.data;
			console.log(`Player event: ${event} at ${currentTime}s of ${duration}s`);
		}
	}}
/>

<div class="flex flex-col min-h-0 text-white bg-black">
	<!-- Mobile Header -->
	<div
		class="flex items-center justify-between p-3 sm:p-4 bg-black border-b border-gray-800 lg:hidden"
	>
		<button
			onclick={toggleSidebar}
			class="p-2 text-white transition-colors duration-200 hover:text-gray-300 rounded-lg hover:bg-gray-800"
		>
			{#if isSidebarVisible}
				<X size={20} class="sm:w-6 sm:h-6" />
			{:else}
				<Menu size={20} class="sm:w-6 sm:h-6" />
			{/if}
		</button>
		<h1 class="text-base sm:text-lg font-bold truncate max-w-[60%] text-center">
			{seriesDetailData.name}
		</h1>

		<button class="p-2 transition-colors duration-200 hover:bg-gray-800 rounded-lg">
			<Bookmark
				onclick={toggleBookmark}
				size={18}
				class="sm:w-5 sm:h-5"
				color={isBookmarked ? "#fb2c36" : "white"}
				fill={isBookmarked ? "#fb2c36" : "none"}
			/>
		</button>
	</div>

	<div class="flex flex-1 min-h-0 overflow-hidden">
		<!-- Sidebar -->
		<div
			class={`
            fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-black border-r border-gray-800 transform transition-transform duration-300 ease-in-out
            sm:w-80
            lg:relative lg:translate-x-0 lg:w-1/4 xl:w-1/5 lg:h-full
            ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}
        `}
		>
			<div class="flex flex-col h-full">
				<!-- Sidebar Header -->
				<div class="flex items-center justify-between p-4 border-b border-gray-800 lg:hidden">
					<h2 class="text-lg font-bold">Episodes</h2>
					<button
						onclick={toggleSidebar}
						class="p-1 text-white transition-colors duration-200 hover:text-gray-300 rounded hover:bg-gray-800"
					>
						<X size={20} />
					</button>
				</div>
				<div class="flex-1 p-3 sm:p-4 overflow-y-auto">
					<!-- Desktop Watchlist Button -->
					<button
						onclick={toggleBookmark}
						class="hidden lg:flex items-center gap-2 w-full p-3 mb-6 transition-colors duration-200 bg-black border border-gray-700 rounded-lg hover:bg-gray-800"
					>
						{#if isBookmarked}
							<Bookmark color="gold" strokeWidth={3} fill="gold" />
						{:else}
							<Bookmark />
						{/if}
						<span class="text-sm">{isBookmarked ? "Added to Bookmark" : "Bookmark"}</span>
					</button>

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
							class="w-full p-3 text-white bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
						>
							{#each seriesDetailData.seasons as season}
								{#if season.season_number !== 0}
									<option value={season.season_number}>
										Season {season.season_number}
									</option>
								{/if}
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
						<div class="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
							{#each episodes as episode, index}
								{#if episode !== 0}
									<button
										onclick={() => selectEpisode(index + 1)}
										class={`w-full p-2 sm:p-3 text-left transition-all duration-200 rounded-lg border flex items-start gap-2 sm:gap-4 ${
											selectedEpisode === index + 1
												? "bg-white text-black border-white"
												: new Date(episode.air_date) > new Date()
													? "bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed"
													: "bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600"
										}`}
										title={new Date(episode.air_date) > new Date()
											? "This episode is not live yet!"
											: ""}
									>
										{#if episode.still_path}
											<img
												loading="eager"
												src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
												alt={`Episode ${episode.episode_number} Still`}
												class="w-16 sm:w-20 md:w-24 h-auto rounded flex-shrink-0 object-cover aspect-video"
											/>
										{:else}
											<div
												class="w-16 sm:w-20 md:w-24 h-9 sm:h-11 md:h-14 rounded flex-shrink-0 bg-gray-700 flex items-center justify-center"
											>
												<span class="text-xs text-gray-500">No Image</span>
											</div>
										{/if}
										<!-- Episode Details -->
										<div class="flex-1 min-w-0 flex flex-col">
											<div class="font-medium truncate text-sm sm:text-base">{episode.name}</div>
											<div class="flex items-center gap-1 sm:gap-2 mt-1 text-xs text-gray-400">
												<span>Ep {episode.episode_number}</span>
												<span>&#8226;</span>
												<span class="hidden sm:inline">{episode.air_date}</span>
												<span class="sm:hidden">{episode.air_date?.slice(0, 7)}</span>
											</div>
										</div>
										{#if selectedEpisode === index + 1}
											<Play size={16} class="sm:w-5 sm:h-5 flex-shrink-0 self-center" />
										{/if}
									</button>
								{/if}
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="flex-1 flex flex-col min-h-0 overflow-y-auto lg:w-3/4 xl:w-4/5">
			<!-- Video Player Section -->
			<div class="flex flex-col min-h-0 p-2 sm:p-4 lg:p-6 shrink-0">
				<div class="mb-2 sm:mb-3 flex-shrink-0">
					<h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1 truncate">
						{seriesDetailData.name}
					</h2>
					<div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
						<span>S{selectedSeason}</span>
						<span>•</span>
						<span>E{selectedEpisode}</span>
						{#if episodes[selectedEpisode - 1]}
							<span class="hidden sm:inline">•</span>
							<span class="hidden sm:inline truncate max-w-40 lg:max-w-none">
								{episodes[selectedEpisode - 1].name}
							</span>
						{/if}
					</div>
				</div>

				<div
					class="series-player-frame relative rounded-lg overflow-hidden bg-black border-2 border-gray-700 shadow-lg"
				>
					{#key `${selectedSource}-${selectedSeason}-${selectedEpisode}`}
						{#if isPlayerLoading}
							<div class="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
								<div class="flex flex-col items-center gap-3 sm:gap-4">
									<div
										class="w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
									></div>
									<p class="text-gray-400 text-sm sm:text-base">Loading episode...</p>
								</div>
							</div>
						{/if}
						<iframe
							src={iframeSources[selectedSource]}
							class="absolute inset-0 block h-full w-full min-h-0 min-w-0 border-0"
							allowfullscreen
							loading="lazy"
							title="Series Player"
							onload={handleIframeLoad}
							scrolling="no"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						></iframe>
					{/key}
				</div>

				<div
					class="mt-2 sm:mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-900 border border-gray-800 rounded-lg flex-shrink-0"
				>
					<div class="flex items-center justify-center sm:justify-start gap-2 shrink-0">
						<button
							onclick={previousEpisode}
							disabled={selectedSeason === 1 && selectedEpisode === 1}
							class="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronLeft size={14} class="sm:w-4 sm:h-4" />
							<span class="hidden xs:inline">Previous</span>
						</button>

						<button
							onclick={nextEpisode}
							disabled={isDisabled}
							class={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg shadow transition-colors ${
								isDisabled
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "text-gray-700 bg-gray-200 hover:bg-gray-300"
							}`}
						>
							<span class="hidden xs:inline">Next</span>
							<ChevronRight size={14} class="sm:w-4 sm:h-4" />
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
									class={`shrink-0 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-[2rem] ${
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

			<!-- Info Section - Scrollable on mobile -->
			<div
				class="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-shrink-0 max-h-64 sm:max-h-72 lg:max-h-80 no-scrollbar"
			>
				<!-- About Section -->
				<div class="p-4 sm:p-6 bg-gray-900 rounded-lg">
					<h3 class="flex items-center gap-2 mb-3 sm:mb-4 text-lg sm:text-xl font-bold">
						<Info size={18} class="sm:w-5 sm:h-5" />
						About {seriesDetailData.name}
					</h3>
					<p class="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
						{seriesDetailData.overview}
					</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<div>
							<h4
								class="flex items-center gap-2 mb-2 text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Star size={12} class="sm:w-4 sm:h-4" />
								Rating
							</h4>
							<div class="flex items-center gap-2">
								<Star size={14} class="sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" />
								<span class="text-white font-medium text-sm sm:text-base">
									{seriesDetailData.vote_average.toFixed(1)}
								</span>
								<span class="text-gray-400 text-sm">/ 10</span>
							</div>
						</div>
						<div>
							<h4
								class="flex items-center gap-2 mb-2 text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Calendar size={12} class="sm:w-4 sm:h-4" />
								First Air Date
							</h4>
							<p class="text-white text-sm sm:text-base">{seriesDetailData.first_air_date}</p>
						</div>
						<div class="sm:col-span-2 lg:col-span-1">
							<h4
								class="flex items-center gap-2 mb-2 text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Users size={12} class="sm:w-4 sm:h-4" />
								Status
							</h4>
							<p class="text-white text-sm sm:text-base">{seriesDetailData.status}</p>
						</div>
					</div>
					<div class="mt-4 sm:mt-6">
						<h4 class="mb-3 text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">
							Genres
						</h4>
						<div class="flex flex-wrap gap-2">
							{#each seriesDetailData.genres as genre}
								<span
									class="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-800 border border-gray-700 rounded-full text-gray-300"
								>
									{genre.name}
								</span>
							{/each}
						</div>
					</div>
				</div>

				<!-- Current Episode Details -->
				{#if episodes[selectedEpisode - 1]}
					<div class="p-4 sm:p-6 bg-gray-900 rounded-lg">
						<h3 class="flex items-center gap-2 mb-3 sm:mb-4 text-lg sm:text-xl font-bold">
							<Play size={18} class="sm:w-5 sm:h-5" />
							Current Episode
						</h3>
						<h4 class="text-base sm:text-lg font-semibold mb-2">
							{episodes[selectedEpisode - 1].name}
						</h4>
						<p class="text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
							{episodes[selectedEpisode - 1].overview}
						</p>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<h4
									class="flex items-center gap-2 mb-2 text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide"
								>
									<Calendar size={12} class="sm:w-4 sm:h-4" />
									Air Date
								</h4>
								<p class="text-white text-sm sm:text-base">
									{episodes[selectedEpisode - 1].air_date}
								</p>
							</div>
							<div>
								<h4
									class="flex items-center gap-2 mb-2 text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide"
								>
									<Star size={12} class="sm:w-4 sm:h-4" />
									Episode Rating
								</h4>
								<div class="flex items-center gap-2">
									<Star size={14} class="sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" />
									<span class="text-white font-medium text-sm sm:text-base">
										{episodes[selectedEpisode - 1].vote_average.toFixed(1)}
									</span>
									<span class="text-gray-400 text-sm">/ 10</span>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Mobile Sidebar Overlay -->
{#if isSidebarVisible}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="button"
		tabindex="0"
		class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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

	@media (min-width: 480px) {
		.xs\:inline {
			display: inline;
		}
	}
</style>
