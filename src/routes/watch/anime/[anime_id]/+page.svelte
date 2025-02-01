<script>
	import { onMount } from 'svelte';
	let { data } = $props();
	let seriesDetailData = data.seriesDetailData;
	let selectedSource = $state(0);

	// Reactive state
	let selectedSeason = $state(1);
	let episodes = $state([]);
	let selectedEpisode = $state(1);

	let subDub = $state('dub');

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
		`https://vidsrc.cc/v3/embed/anime/tmdb${seriesDetailData.id}/${selectedEpisode}/${subDub}?autoPlay=false?adfree=1`,
		// `https://vidsrc.cc/v3/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://vidsrc.icu/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://vidsrc.dev/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`,
		`https://embed.su/embed/tv/${seriesDetailData.id}/${selectedSeason}/${selectedEpisode}`
		// https://embed.su/embed/tv/{tmdb_id}/{season_number}/{episode_number}
	]);

	function changeSource(index) {
		selectedSource = index;
	}

	$effect(() => {
		console.log(selectedSource, iframeSources[selectedSource]);
	});
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<h2 class="mb-4 text-3xl font-bold">
		{seriesDetailData.original_name}
		(s{selectedSeason}ep{selectedEpisode})
	</h2>

	<!-- Video Player -->
	<iframe
		src={iframeSources[selectedSource]}
		class="w-full h-[60vh] rounded-lg shadow-lg"
		allowfullscreen
		loading="lazy"
		title="Movie Player"
	></iframe>

	<br />

	<!-- Centered Buttons -->
	<div class="flex flex-wrap justify-center gap-2 mt-4">
		{#each iframeSources as source, index}
			<button
				class={'px-3 py-2 text-sm font-semibold rounded-md ' +
					(index === selectedSource ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700')}
				onclick={() => changeSource(index)}
			>
				Server {index + 1}
			</button>
		{/each}
	</div>

	<select name="dropdown" bind:value={subDub}>
		<option value="dub">Dub</option>
		<option value="sub">Sub</option>
	</select>
	<!-- Seasons List -->

	<h3 class="mt-6 mb-2 text-2xl font-semibold">Seasons</h3>
	<ul class="flex flex-wrap gap-2 mb-6">
		{#each seriesDetailData.seasons as season}
			<li>
				<button
					onclick={() => fetchEpisodes(season.season_number)}
					class="px-4 py-2 text-white transition duration-200 bg-blue-600 rounded-md hover:bg-blue-700"
				>
					Season {season.season_number}
				</button>
			</li>
		{/each}
	</ul>

	<!-- Episodes List -->
	<h3 class="mt-6 mb-2 text-2xl font-semibold">Episodes</h3>
	<ul class="space-y-2">
		{#each episodes as episode, index}
			<li>
				<button
					onclick={() => selectEpisode(index + 1)}
					class="w-full px-4 py-2 text-left text-white transition duration-200 bg-gray-800 rounded-md hover:bg-gray-700"
				>
					{episode.name} (Episode {episode.episode_number})
				</button>
			</li>
		{/each}
	</ul>
</div>
