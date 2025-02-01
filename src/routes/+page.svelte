<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { onMount } from 'svelte';
	let { data } = $props();
	let popularMovies = data.popularMoviesData;
	let newReleases = data.newReleasesData;
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<section class="container p-4 mx-auto mt-6 rounded-lg">
		{#if popularMovies}
			<h2 class="text-xl font-bold md:text-2xl">Popular Movies</h2>
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
			>
				{#each popularMovies.results as movie}
					<MovieCard {...movie} />
				{/each}
			</div>
		{/if}
	</section>

	<section class="container p-4 mx-auto mt-8 rounded-lg">
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
	</section>
</div>
