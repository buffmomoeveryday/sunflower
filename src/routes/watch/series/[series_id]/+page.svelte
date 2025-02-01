<script>
	import { onMount } from 'svelte';
	let { data } = $props();
	let seriesDetailData = data.seriesDetailData;
	let selectedSource = $state(0);

	// Reactive state
	let selectedSeason = $state(1);
	let episodes = $state([]);
	let selectedEpisode = $state(1);

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

	// Update the selected episode
	function selectEpisode(episodeId) {
		selectedEpisode = episodeId;
		console.log('Selected Episode ID:', selectedEpisode);
	}

	// Initialize with the first season's episodes
	onMount(() => {
		fetchEpisodes(selectedSeason);
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

<div class="flex flex-col min-h-screen text-white bg-black">
	<!-- Sidebar -->
	<div class="p-4 bg-black">
		<h3 class="mb-4 text-xl font-bold text-white">Seasons</h3>
		<div class="mb-4">
			<select
				bind:value={selectedSeason}
				onchange={() => fetchEpisodes(selectedSeason)}
				class="w-full p-3 text-white bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				{#each seriesDetailData.seasons as season}
					<option value={season.season_number}>
						Season {season.season_number}
					</option>
				{/each}
			</select>
		</div>
		<h3 class="mt-6 mb-2 text-xl font-semibold text-white">Episodes</h3>
		<div class="overflow-y-auto h-[40vh]">
			<ul class="space-y-2">
				{#each episodes as episode, index}
					<li>
						<button
							onclick={() => selectEpisode(index + 1)}
							class={'w-full px-4 py-3 text-left transition duration-200 rounded-md ' +
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

	<!-- Main Content -->
	<div class="flex-1 p-4">
		<h2 class="mb-4 text-2xl font-bold text-white">
			{seriesDetailData.original_name} (s{selectedSeason}ep{selectedEpisode})
		</h2>

		<!-- Video Player -->
		<iframe
			src={iframeSources[selectedSource]}
			class="w-full h-[40vh] rounded-lg shadow-lg"
			allowfullscreen
			loading="lazy"
			title="Movie Player"
		></iframe>

		<br />

		<!-- Centered Buttons -->
		<div class="flex flex-wrap justify-center gap-2 mt-4">
			{#each iframeSources as source, index}
				<button
					class={'px-4 py-2 text-sm font-semibold rounded-md ' +
						(index === selectedSource ? 'bg-white text-black' : 'bg-gray-700 hover:bg-gray-600')}
					onclick={() => changeSource(index)}
				>
					Server {index + 1}
				</button>
			{/each}
		</div>
	</div>
</div>
