<script>
	import { onMount } from 'svelte';
	import { Heart } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	let seriesDetailData = data.seriesDetailData;
	let selectedSource = $state(0);

	// Reactive state
	let selectedSeason = $state(1);
	let episodes = $state([]);
	let selectedEpisode = $state(1);
	let isAddedToHome = $state(false);

	// Local storage keys
	const STORAGE_KEY = `series_${seriesDetailData.id}_progress`;
	const HOME_STORAGE_KEY = 'homepage_series';

	// Check if series is already in homepage
	function checkIfSeriesInHome() {
		const storedSeries = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
		return storedSeries.some((series) => series.id === seriesDetailData.id);
	}

	// Add/Remove series from homepage
	function toggleHomeStatus() {
		const storedSeries = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');

		if (isAddedToHome) {
			// Remove series
			const updatedSeries = storedSeries.filter((series) => series.id !== seriesDetailData.id);
			localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(updatedSeries));
			isAddedToHome = false;
			toast.success('Removed From The List');
		} else {
			// Add series
			const seriesData = {
				id: seriesDetailData.id,
				name: seriesDetailData.original_name,
				poster_path: seriesDetailData.poster_path,
				first_air_date: seriesDetailData.first_air_date,
				vote_average: seriesDetailData.vote_average,
				addedAt: new Date().toISOString()
			};
			storedSeries.push(seriesData);
			localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(storedSeries));
			isAddedToHome = true;
			toast.success('Addedto the list');
		}
	}

	// Fetch episodes for the selected season
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
		} catch (error) {
			console.error('Error fetching episodes:', error);
		}
	}

	// Update the selected episode and save to local storage
	function selectEpisode(episodeId) {
		selectedEpisode = episodeId;
		saveProgressAndSelectedSource();
		console.log('Selected Episode ID:', selectedEpisode);
	}

	// Save progress to local storage
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

	// Load progress from local storage
	function loadProgressAndSelectedSource() {
		const progress = localStorage.getItem(STORAGE_KEY);

		if (progress) {
			const { season, episode, source } = JSON.parse(progress);
			selectedSeason = season;
			selectedEpisode = episode;
			selectedSource = source || 1;
		}
	}

	// Initialize with the first season's episodes or loaded progress
	onMount(() => {
		loadProgressAndSelectedSource(); // Load progress from local storage
		fetchEpisodes(selectedSeason); // Fetch episodes for the selected season
		isAddedToHome = checkIfSeriesInHome(); // Check if series is in homepage
	});

	// Derived iframe sources
	let iframeSources = $derived([
		`https://vidsrc.cc/v3/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://vidsrc.icu/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://vidsrc.dev/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://embed.su/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`
	]);

	function changeSource(index) {
		selectedSource = index;
	}
</script>

<div class="flex flex-col min-h-screen text-white bg-black md:flex-row">
	<!-- Sidebar - 1/4 width on md+ screens -->
	<div class="p-4 bg-black md:w-1/4 lg:w-1/5 md:h-screen md:overflow-y-auto">
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

	<!-- Main Content - 3/4 width on md+ screens -->
	<div class="flex-1 p-4 md:w-3/4 lg:w-4/5">
		<h2 class="mb-4 text-xl font-bold text-white">
			{seriesDetailData.original_name} (s{selectedSeason}ep{selectedEpisode})
		</h2>
		<!-- Video Player -->
		<div class="relative w-full" style="padding-top: 56.25%">
			<iframe
				src={iframeSources[selectedSource]}
				class="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
				allowfullscreen
				loading="lazy"
				title="Movie Player"
			></iframe>
		</div>
		<!-- Centered Buttons -->
		<div class="flex flex-wrap justify-center gap-2 mt-4">
			{#each iframeSources as source, index}
				<button
					class={'px-3 py-2 text-sm font-semibold rounded-md ' +
						(index === selectedSource ? 'bg-white text-black' : 'bg-gray-700 hover:bg-gray-600')}
					onclick={() => changeSource(index)}
				>
					Server {index + 1}
				</button>
			{/each}
		</div>

		<!-- Series Details Section -->
		<div class="mt-8 space-y-6">
			<!-- Overview -->
			<div class="p-6 bg-gray-800 rounded-lg">
				<h3 class="mb-4 text-xl font-bold">About {seriesDetailData.original_name}</h3>
				<p class="text-gray-300">{seriesDetailData.overview}</p>

				<!-- Additional Details -->
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

			<!-- Current Episode Info -->
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
