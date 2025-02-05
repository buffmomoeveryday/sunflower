<script>
	import MovieCard from '$lib/components/MovieCard.svelte';
	import SeriesCard from '$lib/components/SeriesCard.svelte';
	import AnimeCard from '$lib/components/AnimeCard.svelte';
	let { data } = $props();
	let animeDatas = data.animeData;
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<section class="container p-4 mx-auto mt-6 rounded-lg">
		<h2 class="text-xl font-bold md:text-2xl">Animes</h2>
		<div
			class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
		>
			{#each animeDatas.results as animeData}
				<AnimeCard {...animeData} />
			{/each}
		</div>
	</section>

	<form method="get">
		<input type="number" />
		<button>Next Page</button>
	</form>

	<!-- <section class="container p-4 mx-auto mt-8 rounded-lg">
		{#if newReleases}
			<h2 class="text-xl font-bold md:text-2xl">New Releases</h2>
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				{#each newReleases.results as movie}
					<MovieCard {...movie} />
				{/each}
			</div>
		{/if}
	</section> -->
</div>
