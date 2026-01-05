<script>
	import { toggleSeriesBookmark, addToSeriesHistory } from "$lib/remote/bookmarks.remote.js";
	import { isSeriesBookmarkedLocal, addBookmarkLocal, removeBookmarkLocal } from "$lib/state/bookmarks.svelte.js";
	import { onMount } from "svelte";

	import { toast } from "svelte-sonner";

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

	const selectedSource = new PersistedState(`selected_source_${seriesDetailData.id}`, 0);
	const selectedSeason = new PersistedState(`selected_season_${seriesDetailData.id}`, 1);
	const selectedEpisode = new PersistedState(`selected_episodes_${seriesDetailData.id}`, 1);

	let episodes = $state([]);
	let isBookmarked = $derived(isSeriesBookmarkedLocal(seriesDetailData.id));

	let isSidebarVisible = $state(false);
	let isPlayerLoading = $state(true);

	const STORAGE_KEY = `series_${seriesDetailData.id}_progress`;
	const HOME_STORAGE_KEY = "homepage_series";
	const SERIES_ADDED_KEY = `series_${seriesDetailData.id}_added`;

	let iframeSources = $derived([
		`https://vidsrc.icu/embed/tv/${seriesDetailData.id}/${selectedSeason.current}/${selectedEpisode.current}`,
		`https://embed.su/embed/tv/${seriesDetailData.id}/${selectedSeason.current}/${selectedEpisode.current}`,
		`https://player.autoembed.cc/embed/tv/${seriesDetailData.id}/${selectedSeason.current}/${selectedEpisode.current}`,
		`https://111movies.com/tv/${seriesDetailData.id}/${selectedSeason.current}/${selectedEpisode.current}`,
		`https://vidjoy.pro/embed/tv/${seriesDetailData.id}/${selectedSeason.current}/${selectedEpisode.current}`,
		`https://embed.rgshows.me/api/2/tv/?id=${seriesDetailData.id}&s=${selectedSeason.current}&e=${selectedEpisode.current}`,
		`https://embed.rgshows.me/api/3/tv/?id=${seriesDetailData.id}&s=${selectedSeason.current}&e=${selectedEpisode.current}`,
		`https://player.videasy.net/tv/${seriesDetailData.id}/${selectedSeason.current}/${selectedEpisode.current}`,
		`https://mappletv.uk/watch/tv/${seriesDetailData.id}-${selectedSeason.current}-${selectedEpisode.current}`,
		`https://vidfast.pro/tv/${seriesDetailData.id}/${selectedSeason.current}/${selectedEpisode.current}?autoPlay=true`,
		`https://vidlink.pro/tv/${seriesDetailData.id}/${selectedSeason.current}/${selectedEpisode.current}`
	]);

	let isNextEpisodeAvailable = $derived(() => {
		const currentEpisodeIndex = selectedEpisode.current - 1;
		if (currentEpisodeIndex + 1 < episodes.length) {
			const nextEpisode = episodes[currentEpisodeIndex + 1];
			return new Date(nextEpisode.air_date) <= new Date();
		} else {
			return selectedSeason.current < seriesDetailData.seasons.length;
		}
	});

	let isDisabled = $derived.by(() => {
		!isNextEpisodeAvailable ||
			(selectedSeason.current >= seriesDetailData.seasons.length &&
				selectedEpisode.current >= episodes.length);
	});

	async function updateProgressInDatabase() {
		if (!isBookmarked) return;
		if (!user) return;
		try {
			const response = await fetch("/api/series/watchlist/save", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					user_id: data.user.id,
					tmdb_id: seriesDetailData.id,
					season_id: selectedSeason.current,
					episode_id: selectedEpisode.current,
					title: seriesDetailData.name,
					poster_path: seriesDetailData.poster_path,
					average_ratings: seriesDetailData.vote_average
				})
			});
			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.message || "Failed to update progress");
			}
		} catch (error) {
			console.error("Error updating progress:", error);
			toast.error("Failed to save progress");
		}
	}

	async function fetchEpisodes(seasonNumber) {
		selectEpisode.current = seasonNumber;
		let result = await getEpisodes({
			tvId: seriesDetailData.id.toString(),
			seasonNumber: seasonNumber.toString()
		});
		episodes = result.episodes;
	}

	async function selectEpisode(episodeId) {
		selectedEpisode.current = episodeId;
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

	function loadProgressAndSelectedSource() {
		const progress = localStorage.getItem(STORAGE_KEY);
		if (progress) {
			const { season, episode, source } = JSON.parse(progress);
			selectedSeason.current = season;
			selectedEpisode.current = episode;
			selectedSource.current = source || 1;
		}
	}

	function changeSource(index) {
		selectedSource.current = index;
		isPlayerLoading = true;
		saveProgressAndSelectedSource();
	}

	function handleIframeLoad() {
		isPlayerLoading = false;
	}

	async function getProgress() {}

	function previousEpisode() {
		if (selectedEpisode.current > 1) {
			selectEpisode(selectedEpisode.current - 1);
		} else if (selectedSeason.current > 1) {
			selectedSeason.current--;
			fetchEpisodes(selectedSeason.current).then(() => {
				selectEpisode(episodes.length);
			});
		}
	}

	function nextEpisode() {
		if (selectedEpisode.current < episodes.length) {
			const nextEpisodeData = episodes[selectedEpisode.current]; // selectedEpisode is 1-based
			if (new Date(nextEpisodeData.air_date) <= new Date()) {
				selectEpisode(selectedEpisode.current + 1);
			}
		} else if (selectedSeason.current < seriesDetailData.seasons.length) {
			selectedSeason.current++;
			fetchEpisodes(selectedSeason.current).then(() => {
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
				if (result.action === 'added') {
					addBookmarkLocal('series', seriesDetailData.id);
					toast.success("Added to bookmark");
				} else {
					removeBookmarkLocal('series', seriesDetailData.id);
					toast.success("Removed from bookmark");
				}
			} else {
				toast.error(result.error || "Failed to toggle bookmark");
			}
		} catch (e) {
			console.error("Bookmark error:", e);
		}
	}	onMount(async () => {
		await fetchEpisodes(selectedSeason.current);

		await getProgress();
		
		setTimeout(async () => {
			try {
				await addToSeriesHistory({
					tmdb_id: seriesDetailData.id,
					poster_path: seriesDetailData.poster_path,
					name: seriesDetailData.name,
					vote_average: seriesDetailData.vote_average,
					first_air_date: seriesDetailData.first_air_date,
					number_of_seasons: seriesDetailData.number_of_seasons
				});
			} catch (error) {
				console.error("Error adding to watch history:", error);
			}
		}, 5000);
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

<div class="flex flex-col min-h-screen text-white bg-black">
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

	<div class="flex flex-1 overflow-hidden">
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
							bind:value={selectedSeason.current}
							onchange={() => fetchEpisodes(selectedSeason.current)}
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
											selectedEpisode.current === index + 1
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
		<div class="flex-1 flex flex-col lg:w-3/4 xl:w-4/5 min-h-0">
			<!-- Video Player Section -->
			<div class="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 min-h-0">
				<!-- Title - Hidden on mobile when sidebar is visible -->
				<div class="mb-3 sm:mb-4 flex-shrink-0">
					<h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 truncate">
						{seriesDetailData.name}
					</h2>
					<div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
						<span>S{selectedSeason.current}</span>
						<span>•</span>
						<span>E{selectedEpisode.current}</span>
						{#if episodes[selectedEpisode.current - 1]}
							<span class="hidden sm:inline">•</span>
							<span class="hidden sm:inline truncate max-w-40 lg:max-w-none">
								{episodes[selectedEpisode.current - 1].name}
							</span>
						{/if}
					</div>
				</div>

				<!-- Video Player Container - Responsive aspect ratio -->
				<div class="relative flex-1 mb-3 sm:mb-4 min-h-0">
					<!-- Ensure minimum height for mobile -->
					<div
						class="w-full h-full min-h-[200px] sm:min-h-[250px] md:min-h-[350px] lg:min-h-[400px]"
					>
						<!-- Loading Skeleton -->
						{#if isPlayerLoading}
							<div
								class="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center z-10"
							>
								<div class="flex flex-col items-center gap-3 sm:gap-4">
									<div
										class="w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
									></div>
									<p class="text-gray-400 text-sm sm:text-base">Loading episode...</p>
								</div>
							</div>
						{/if}

						<!-- Video Player -->
						<iframe
							src={iframeSources[selectedSource.current]}
							class="w-full h-full border-2 border-gray-700 rounded-lg shadow-lg"
							allowfullscreen
							loading="lazy"
							title="Series Player"
							onload={handleIframeLoad}
							scrolling="no"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						></iframe>
					</div>
				</div>

				<!-- Player Controls - Responsive layout -->
				<div
					class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900 rounded-lg flex-shrink-0"
				>
					<!-- Navigation Controls -->
					<div class="flex items-center justify-center sm:justify-start gap-2">
						<button
							onclick={previousEpisode}
							disabled={selectedSeason.current === 1 && selectedEpisode.current === 1}
							class="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronLeft size={14} class="sm:w-4 sm:h-4" />
							<span class="hidden xs:inline">Previous</span>
						</button>

						<button
							onclick={nextEpisode}
							disabled={isDisabled}
							class={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg shadow transition-colors
                            ${
															isDisabled
																? "bg-gray-100 text-gray-400 cursor-not-allowed"
																: "text-gray-700 bg-gray-200 hover:bg-gray-300"
														}`}
						>
							<span class="hidden xs:inline">Next</span>
							<ChevronRight size={14} class="sm:w-4 sm:h-4" />
						</button>
					</div>

					<!-- Server Selection - Responsive grid -->
					<div class="flex flex-col sm:flex-row items-center gap-2">
						<span class="text-xs sm:text-sm font-medium text-gray-400 whitespace-nowrap"
							>Server:</span
						>
						<div class="flex flex-wrap items-center justify-center gap-1 sm:gap-2 max-w-full">
							{#each iframeSources as source, index}
								<button
									class={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-[32px] ${
										index === selectedSource.current
											? "bg-white text-black"
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
				{#if episodes[selectedEpisode.current - 1]}
					<div class="p-4 sm:p-6 bg-gray-900 rounded-lg">
						<h3 class="flex items-center gap-2 mb-3 sm:mb-4 text-lg sm:text-xl font-bold">
							<Play size={18} class="sm:w-5 sm:h-5" />
							Current Episode
						</h3>
						<h4 class="text-base sm:text-lg font-semibold mb-2">
							{episodes[selectedEpisode.current - 1].name}
						</h4>
						<p class="text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
							{episodes[selectedEpisode.current - 1].overview}
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
									{episodes[selectedEpisode.current - 1].air_date}
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
										{episodes[selectedEpisode.current - 1].vote_average.toFixed(1)}
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
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	/* Custom breakpoint for extra small screens */
	@media (min-width: 480px) {
		.xs\:inline {
			display: inline;
		}
	}
</style>
