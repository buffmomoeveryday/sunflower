<script>
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
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

	// Reactive state
	let selectedSource = $state(0);
	let selectedSeason = $state(1);
	let episodes = $state([]);
	let selectedEpisode = $state(1);
	let isAddedToHome = $state(false);
	let isSidebarVisible = $state(false); // Start hidden on mobile
	let isPlayerLoading = $state(true); // Track loading state

	// Local storage keys
	const STORAGE_KEY = `series_${seriesDetailData.id}_progress`;
	const HOME_STORAGE_KEY = 'homepage_series';
	const SERIES_ADDED_KEY = `series_${seriesDetailData.id}_added`;

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
		`https://drama.autoembed.cc/embed/kissed-by-the-rain-2024-episode-11`
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
		if (!isAddedToHome) return;
		if (!user) return;
		try {
			const response = await fetch('/api/series/watchlist/save', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					user_id: data.user.id,
					tmdb_id: seriesDetailData.id,
					season_id: selectedSeason,
					episode_id: selectedEpisode,
					title: seriesDetailData.name,
					poster_path: seriesDetailData.poster_path,
					average_ratings: seriesDetailData.vote_average
				})
			});
			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.message || 'Failed to update progress');
			}
		} catch (error) {
			console.error('Error updating progress:', error);
			toast.error('Failed to save progress');
		}
	}
	async function callWatchlistAPI(action) {
		if (!user) return;
		try {
			if (action === 'add') {
				const response = await fetch('/api/series/watchlist/save', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						user_id: data.user.id,
						tmdb_id: seriesDetailData.id,
						season_id: selectedSeason,
						episode_id: selectedEpisode,
						title: seriesDetailData.name,
						poster_path: seriesDetailData.poster_path,
						average_ratings: seriesDetailData.vote_average
					})
				});
				const result = await response.json();
				if (response.ok) {
					toast.success('Added to watchlist');
				} else {
					throw new Error(result.message || 'Failed to add to watchlist');
				}
			} else if (action === 'remove') {
				const response = await fetch('/api/series/watchlist/save', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: seriesDetailData.id, user_id: user.id })
				});
				if (response.ok) {
					toast.success('Removed from watchlist');
				} else {
					const result = await response.json();
					throw new Error(result.message || 'Failed to remove from watchlist');
				}
			}
		} catch (error) {
			console.error('Error calling watchlist API:', error);
			toast.error('An error occurred');
		}
	}
	function checkIfSeriesInHome() {
		const storedSeries = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
		return storedSeries.some((series) => series.id === seriesDetailData.id);
	}
	function storeSeriesDataOnceWithDelay() {
		const isSeriesAlreadyAdded = localStorage.getItem(SERIES_ADDED_KEY);
		if (!isSeriesAlreadyAdded) {
			setTimeout(async () => {
				const storedSeries = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
				const seriesData = {
					id: seriesDetailData.id,
					name: seriesDetailData.name,
					poster_path: seriesDetailData.poster_path,
					first_air_date: seriesDetailData.first_air_date,
					vote_average: seriesDetailData.vote_average,
					addedAt: new Date().toISOString(),
					user_id: user.id
				};
				storedSeries.push(seriesData);
				localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(storedSeries));
				localStorage.setItem(SERIES_ADDED_KEY, 'true');
				isAddedToHome = true;
				if (data.user.id) await callWatchlistAPI('add');
			}, 4000);
		}
	}
	async function toggleHomeStatus() {
		const storedSeries = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
		if (isAddedToHome) {
			const updatedSeries = storedSeries.filter((series) => series.id !== seriesDetailData.id);
			localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(updatedSeries));
			isAddedToHome = false;
			if (data.user.id) {
				await callWatchlistAPI('remove');
			}
		} else {
			const seriesData = {
				id: seriesDetailData.id,
				name: seriesDetailData.name,
				poster_path: seriesDetailData.poster_path,
				first_air_date: seriesDetailData.first_air_date,
				vote_average: seriesDetailData.vote_average,
				addedAt: new Date().toISOString(),
				user_id: user.id
			};
			storedSeries.push(seriesData);
			localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(storedSeries));
			isAddedToHome = true;
			if (data.user.id) await callWatchlistAPI('add');
		}
	}
	async function fetchEpisodes(seasonNumber) {
		selectedSeason = seasonNumber;
		try {
			let response = await fetch('/api/series/episodes', {
				method: 'POST',
				body: new URLSearchParams({
					tv_id: seriesDetailData.id,
					season_number: seasonNumber
				})
			});
			let result = await response.json();
			episodes = result.episodes;
			await updateProgressInDatabase();
		} catch (error) {
			console.error('Error fetching episodes:', error);
		}
	}
	async function selectEpisode(episodeId) {
		selectedEpisode = episodeId;
		isPlayerLoading = true; // Set loading state when changing episodes
		saveProgressAndSelectedSource();
		await updateProgressInDatabase();
	}
	function saveProgressAndSelectedSource() {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				season: selectedSeason,
				episode: selectedEpisode,
				source: selectedSource
			})
		);
	}
	function loadProgressAndSelectedSource() {
		const progress = localStorage.getItem(STORAGE_KEY);
		if (progress) {
			const { season, episode, source } = JSON.parse(progress);
			selectedSeason = season;
			selectedEpisode = episode;
			selectedSource = source || 1;
		}
	}
	function changeSource(index) {
		selectedSource = index;
		isPlayerLoading = true; // Set loading state when changing sources
		saveProgressAndSelectedSource();
	}
	function handleIframeLoad() {
		isPlayerLoading = false; // Remove loading state when iframe loads
	}
	async function getProgress() {
		if (user) {
			try {
				let response = await fetch('/api/series/watchlist/get', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						user_id: data.user.id,
						tmdb_id: seriesDetailData.id
					})
				});
				if (response.ok) {
					isAddedToHome = true;
					let result = await response.json();
					if (result.records) {
						selectedSeason = result.records.season_id;
						selectedEpisode = result.records.episode_id;
						isAddedToHome = !isAddedToHome;
					}
				}
			} catch (error) {
				console.error('Error fetching watchlist data:', error);
			}
		}
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
		storeSeriesDataOnceWithDelay();
		await getProgress();
		loadProgressAndSelectedSource();
		await fetchEpisodes(selectedSeason);
		isAddedToHome = checkIfSeriesInHome();
	});
</script>

<div class="flex flex-col min-h-screen text-white bg-black">
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
				onclick={toggleHomeStatus}
				class="p-2 transition-colors duration-200 hover:bg-gray-800 rounded-lg"
			>
				<Heart
					size={20}
					color={isAddedToHome ? '#fb2c36' : 'white'}
					fill={isAddedToHome ? '#fb2c36' : 'none'}
				/>
			</button>
		{/if}
	</div>
	<div class="flex flex-1 overflow-hidden">
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
							onclick={toggleHomeStatus}
						>
							<Heart
								size={20}
								color={isAddedToHome ? '#fb2c36' : 'white'}
								fill={isAddedToHome ? '#fb2c36' : 'none'}
							/>
							<span class="text-sm">{isAddedToHome ? 'Added to Home' : 'Add to Home'}</span>
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
									class={`w-full p-3 text-left transition-all duration-200 rounded-lg border flex items-start gap-4 ${
										selectedEpisode === index + 1
											? 'bg-white text-black border-white'
											: new Date(episode.air_date) > new Date()
												? 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed'
												: 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600'
									}`}
									title={new Date(episode.air_date) > new Date()
										? 'This episode is not live yet!'
										: ''}
								>
									<!-- Episode Still Image - Increased size -->
									{#if episode.still_path}
										<img
											src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
											alt={`Episode ${episode.episode_number} Still`}
											class="w-24 h-auto rounded flex-shrink-0 object-cover aspect-video"
										/>
									{:else}
										<!-- Placeholder if no image - Increased size -->
										<div
											class="w-24 h-14 rounded flex-shrink-0 bg-gray-700 flex items-center justify-center"
										>
											<!-- Increased width (w-24) and height (h-14) -->
											<span class="text-xs text-gray-500">No Image</span>
										</div>
									{/if}
									<!-- Episode Details -->
									<div class="flex-1 min-w-0 flex flex-col">
										<div class="font-medium truncate">{episode.name}</div>
										<div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
											<span>Episode {episode.episode_number}</span>
											<span>&#8226;</span>
											<span>{episode.air_date}</span>
										</div>
										<!-- Optional: Add a brief overview snippet if available and space allows -->
										<!-- <p class="text-xs text-gray-500 mt-1 truncate">{episode.overview || 'No overview available.'}</p> -->
									</div>
									<!-- Play Icon for Selected Episode -->
									{#if selectedEpisode === index + 1}
										<Play size={18} class="flex-shrink-0 self-center" />
										<!-- Slightly larger play icon -->
									{/if}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- Main Content -->
		<div class="flex-1 flex flex-col md:w-3/4 lg:w-4/5 min-h-0">
			<!-- Video Player Section - Full Screen -->
			<div class="flex-1 flex flex-col p-4 md:p-6 min-h-0">
				<!-- Title -->
				<div class="mb-4 flex-shrink-0">
					<h2 class="text-xl md:text-2xl font-bold text-white mb-2">
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
				<!-- Video Player Container - Takes up remaining space -->
				<div class="relative flex-1 mb-4 min-h-0">
					<!-- Loading Skeleton -->
					{#if isPlayerLoading}
						<div class="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
							<div class="flex flex-col items-center gap-4">
								<div
									class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
								></div>
								<p class="text-gray-400">Loading episode...</p>
							</div>
						</div>
					{/if}
					<!-- Video Player -->
					<iframe
						src={iframeSources[selectedSource]}
						class="w-full h-full border-2 border-gray-700 rounded-lg shadow-lg"
						allowfullscreen
						loading="lazy"
						title="Series Player"
						onload={handleIframeLoad}
						scrolling="no"
					></iframe>
				</div>
				<!-- Player Controls -->
				<div
					class="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-900 rounded-lg flex-shrink-0"
				>
					<div class="flex items-center gap-2">
						<button
							onclick={previousEpisode}
							disabled={selectedSeason === 1 && selectedEpisode === 1}
							class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronLeft size={16} />
							<span class="hidden sm:inline">Previous</span>
						</button>
						<!-- <button
                            onclick={nextEpisode}
                            disabled={selectedSeason >= seriesDetailData.seasons.length && selectedEpisode >= episodes.length}
                            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <span class="hidden sm:inline">Next</span>
                            <ChevronRight size={16} />
                        </button> -->
						<button
							onclick={nextEpisode}
							disabled={isDisabled}
							class={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow transition-colors
                            ${
															isDisabled
																? 'bg-gray-100 text-gray-400 cursor-not-allowed'
																: 'text-gray-700 bg-gray-200 hover:bg-gray-300'
														}`}
						>
							<span class="hidden sm:inline">Next</span>
							<ChevronRight size={16} />
						</button>
					</div>
					<!-- Server Selection -->
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium text-gray-400">Server:</span>
						{#each iframeSources as source, index}
							<button
								class={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
									index === selectedSource
										? 'bg-white text-black'
										: 'bg-gray-700 text-white hover:bg-gray-600'
								}`}
								onclick={() => changeSource(index)}
							>
								{index + 1}
							</button>
						{/each}
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
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
