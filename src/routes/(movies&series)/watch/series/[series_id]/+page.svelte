<script>
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Heart, ChevronLeft, ChevronRight } from 'lucide-svelte';

	let { data } = $props();
	let seriesDetailData = data.seriesDetailData;
	let user = data?.user;

	// Reactive state
	let selectedSource = $state(0);
	let selectedSeason = $state(1);
	let episodes = $state([]);
	let selectedEpisode = $state(1);
	let isAddedToHome = $state(false);
	let isSidebarVisible = $state(true);
	// Derived State
	let iframeSources = $derived([
		`https://vidsrc.cc/v3/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://vidsrc.icu/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://vidsrc.dev/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://embed.su/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://player.videasy.net/movie/299534`
	]);

	// Local storage keys
	const STORAGE_KEY = `series_${seriesDetailData.id}_progress`;
	const HOME_STORAGE_KEY = 'homepage_series';
	const SERIES_ADDED_KEY = `series_${seriesDetailData.id}_added`;

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
		// if (!isAddedToHome) return;
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
				('removed called');
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
					name: seriesDetailData.original_name,
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
			}, 4000); // Wait for the delay before enabling the button
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
			} else {
			}
		} else {
			const seriesData = {
				id: seriesDetailData.id,
				name: seriesDetailData.original_name,
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
		saveProgressAndSelectedSource();
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
						isAddedToHome != isAddedToHome;
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
				selectEpisode(episodes.length); // Go to the last episode of the previous season
			});
		}
	}

	function nextEpisode() {
		if (selectedEpisode < episodes.length) {
			selectEpisode(selectedEpisode + 1);
		} else {
			// If the current season's last episode, go to the first episode of the next season
			selectedSeason++;
			fetchEpisodes(selectedSeason).then(() => {
				selectEpisode(1); // Go to the first episode of the next season
			});
		}
	}

	onMount(async () => {
		storeSeriesDataOnceWithDelay();
		await getProgress();
		loadProgressAndSelectedSource();
		await fetchEpisodes(selectedSeason);
		isAddedToHome = checkIfSeriesInHome();
	});
</script>

<div class="flex flex-col min-h-screen text-white bg-black md:flex-row">
	<!-- Sidebar - 1/4 width on md+ screens -->
	<div class="p-4 bg-black md:w-1/4 lg:w-1/5 md:h-screen md:overflow-y-auto">
		{#if user}
			<button
				class="flex items-center gap-2 p-2 transition-colors duration-200 bg-black border border-gray-700 rounded-lg hover:bg-gray-800"
				onclick={toggleHomeStatus}
			>
				<Heart
					size={24}
					color={isAddedToHome ? '#fb2c36' : 'white'}
					fill={isAddedToHome ? '#fb2c36' : 'none'}
				/>
				<span>{isAddedToHome ? 'Added to Home' : 'Add to Home'}</span>
			</button>
		{/if}

		<h3 class="mb-4 text-lg font-bold text-white">Seasons</h3>
		<div class="mb-4">
			<select
				bind:value={selectedSeason}
				onchange={() => fetchEpisodes(selectedSeason)}
				class="w-full p-2 text-white bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				{#each seriesDetailData.seasons as season}
					<option value={season.season_number}>
						Season {season.season_number}
					</option>
				{/each}
			</select>
		</div>
		<h3 class="mt-4 mb-2 text-lg font-semibold text-white">Episodes</h3>
		<div class="overflow-y-auto h-[40vh] md:h-auto">
			<ul class="space-y-1">
				{#each episodes as episode, index}
					<li>
						<button
							onclick={() => selectEpisode(index + 1)}
							class={'w-full px-3 py-2 text-left text-sm transition duration-200 rounded-md ' +
								(selectedEpisode === index + 1
									? 'bg-white text-black'
									: 'bg-gray-800 hover:bg-gray-700')}
						>
							{episode.name} (Episode {episode.episode_number})
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="flex-1 p-4 md:w-3/4 lg:w-4/5">
		<h2 class="mb-4 text-xl font-bold text-white">
			{seriesDetailData.original_name} (s{selectedSeason}ep{selectedEpisode})
		</h2>
		<!-- iframe -->
		<div class="relative w-full" style="padding-top: 56.25%">
			<iframe
				src={iframeSources[selectedSource]}
				class="absolute top-0 left-0 w-full h-full border-2 border-white rounded-lg shadow-lg"
				allowfullscreen
				loading="lazy"
				title="Movie Player"
			></iframe>
		</div>
		<div class="flex flex-wrap justify-center gap-2 mt-4">
			<button
				onclick={previousEpisode}
				disabled={selectedSeason === 1 && selectedEpisode === 1}
				class="flex items-center px-3 py-2 text-gray-600 transition-all bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
			>
				<ChevronLeft class="w-5 h-5" />
				<span class="ml-2">Previous</span>
			</button>
			{#each iframeSources as source, index}
				<button
					class={'px-3 py-2 text-sm font-semibold rounded-md ' +
						(index === selectedSource ? 'bg-white text-black' : 'bg-gray-700 hover:bg-gray-600')}
					onclick={() => changeSource(index)}
				>
					Server {index + 1}
				</button>
			{/each}
			<!-- Next Button -->
			<button
				onclick={nextEpisode}
				disabled={selectedSeason >= seriesDetailData.total_seasons &&
					selectedEpisode >= episodes.length}
				class="flex items-center px-3 py-2 text-gray-600 transition-all bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
			>
				<span class="mr-2">Next</span>
				<ChevronRight class="w-5 h-5" />
			</button>
		</div>
		<div class="mt-8 space-y-6">
			<div class="p-6 bg-gray-800 rounded-lg">
				<h3 class="mb-4 text-xl font-bold">About {seriesDetailData.original_name}</h3>
				<p class="text-gray-300">{seriesDetailData.overview}</p>
				<div class="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
					<div>
						<h4 class="mb-2 text-sm font-semibold text-gray-400">Rating</h4>
						<p class="flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="text-yellow-500"
							>
								<path
									d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
								/>
							</svg>
							{seriesDetailData.vote_average.toFixed(1)} / 10
						</p>
					</div>
					<div>
						<h4 class="mb-2 text-sm font-semibold text-gray-400">First Air Date</h4>
						<p>{seriesDetailData.first_air_date}</p>
					</div>
					<div>
						<h4 class="mb-2 text-sm font-semibold text-gray-400">Genres</h4>
						<div class="flex flex-wrap gap-2">
							{#each seriesDetailData.genres as genre}
								<span class="px-2 py-1 text-sm bg-gray-700 rounded-full">{genre.name}</span>
							{/each}
						</div>
					</div>
					<div>
						<h4 class="mb-2 text-sm font-semibold text-gray-400">Status</h4>
						<p>{seriesDetailData.status}</p>
					</div>
				</div>
			</div>

			{#if episodes[selectedEpisode - 1]}
				<div class="p-6 bg-gray-800 rounded-lg">
					<h3 class="mb-4 text-xl font-bold">Current Episode</h3>
					<h4 class="mb-2 text-lg">{episodes[selectedEpisode - 1].name}</h4>
					<p class="text-gray-300">{episodes[selectedEpisode - 1].overview}</p>
					<div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
						<div>
							<h4 class="mb-2 text-sm font-semibold text-gray-400">Air Date</h4>
							<p>{episodes[selectedEpisode - 1].air_date}</p>
						</div>
						<div>
							<h4 class="mb-2 text-sm font-semibold text-gray-400">Episode Rating</h4>
							<p class="flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="text-yellow-500"
								>
									<path
										d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
									/>
								</svg>
								{episodes[selectedEpisode - 1].vote_average.toFixed(1)} / 10
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
