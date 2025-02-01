<script>
	import { onMount } from 'svelte';
	let { data } = $props();
	let seriesDetailData = data.seriesDetailData;
	let selectedSource = $state(0);

	// Reactive state
	let selectedSeason = $state(1);
	let episodes = $state([]);
	let selectedEpisode = $state(1);

	// Local storage keys
	const STORAGE_KEY = `series_${seriesDetailData.id}_progress`;

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

	$effect(() => {
		console.log(selectedSource, iframeSources[selectedSource]);
	});
</script>

<div class="flex flex-col min-h-screen text-white bg-black md:flex-row">
	<!-- Sidebar - 1/4 width on md+ screens -->
	<div class="p-4 bg-black md:w-1/4 lg:w-1/5 md:h-screen md:overflow-y-auto">
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
	</div>
</div>
