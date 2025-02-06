<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let stream_id = $page.params.id;
	let res = $state(null);
	let selectedStreamIndex = $state(0);

	onMount(async () => {
		try {
			const getting_url = `https://streamed.su/api/stream/alpha/${stream_id}`;
			const response = await fetch(getting_url);
			if (!response.ok) {
				throw new Error('Failed to fetch streams');
			}
			res = await response.json();
		} catch (error) {
			console.error('Error fetching stream data:', error);
			res = { error: error.message };
		}
	});

	function changeStream(index) {
		selectedStreamIndex = index;
	}
</script>

<div class="min-h-screen p-6 text-white bg-black">
	{#if res === null}
		<p>Loading streams...</p>
	{:else if res.error}
		<p>Error: {res.error}</p>
	{:else if res.length == 0}
		<p>Empty...</p>
	{:else}
		<h2 class="mb-4 text-xl font-bold">Available Streams</h2>

		<!-- Stream Selection Buttons -->
		<div class="flex flex-wrap gap-2 mb-6">
			{#each res as stream, index}
				<button
					class="px-4 py-2 text-white transition-colors duration-200 bg-gray-800 rounded hover:bg-gray-700"
					onclick={() => changeStream(index)}
				>
					Stream {stream.streamNo}
				</button>
			{/each}
		</div>

		<!-- Embedded Stream -->
		{#if res[selectedStreamIndex]}
			<div class="mb-6">
				<h3 class="mb-2 text-lg font-semibold">
					Currently Playing: Stream {res[selectedStreamIndex].streamNo}
				</h3>
				<iframe
					title=""
					src={res[selectedStreamIndex].embedUrl}
					width="100%"
					height="400px"
					frameborder="0"
					allowfullscreen
					class="border-2 border-white rounded-lg shadow-md"
				></iframe>
			</div>

			<!-- Stream Details -->
			<div>
				<p><strong>Language:</strong> {res[selectedStreamIndex].language}</p>
				<p><strong>HD:</strong> {res[selectedStreamIndex].hd ? 'Yes' : 'No'}</p>
			</div>
		{/if}
	{/if}
</div>
