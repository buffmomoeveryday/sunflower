<script>
	import { onMount } from 'svelte';

	const matchesLiveAPIUrl = 'https://streamed.su/api/matches/live';
	const matchesTodayAPIUrl = 'https://streamed.su/api/matches/all-today';

	let matchesLive = null;
	let matchesToday = null;

	let football = [];
	let cricket = [];
	let basketball = [];

	function formatUnixTimestamp(timestamp) {
		const isSeconds = timestamp.toString().length === 10; // Check if it's in seconds
		const date = new Date(isSeconds ? timestamp * 1000 : timestamp);
		return date.toLocaleString();
	}

	onMount(async () => {
		try {
			const matchesLiveResponse = await fetch(matchesLiveAPIUrl);
			if (!matchesLiveResponse.ok) throw new Error('Failed to fetch live matches');
			matchesLive = await matchesLiveResponse.json();

			const matchesTodayResponse = await fetch(matchesTodayAPIUrl);
			if (!matchesTodayResponse.ok) throw new Error("Failed to fetch today's matches");
			matchesToday = await matchesTodayResponse.json();

			football = matchesLive.filter((match) => match.category === 'football');
			cricket = matchesLive.filter((match) => match.category === 'cricket');
			basketball = matchesLive.filter((match) => match.category === 'basketball');
		} catch (error) {
			console.error('Error fetching match data:', error);
		}
	});
</script>

<h1 class="text-4xl font-bold">Football</h1>
{#each football as match}
	<a href="/sports/streams/{match.id}">
		{match.title} - {formatUnixTimestamp(match.date)}<br />
	</a>
{/each}

<hr class="mt-2 mb-2 border border-black" />
<h1 class="text-4xl font-bold">Cricket</h1>
{#each cricket as match}
	<a href="/sports/streams/{match.id}">
		{match.title} - {formatUnixTimestamp(match.date)}<br />
	</a>
{/each}

<hr class="mt-2 mb-2 border border-black" />
<h1 class="text-4xl font-bold">Basketball</h1>
{#each basketball as match}
	<a href="/sports/streams/{match.id}">
		{match.title} - {formatUnixTimestamp(match.date)}<br />
	</a>
{/each}
