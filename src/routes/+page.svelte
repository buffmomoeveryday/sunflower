<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { onMount } from 'svelte';
	let { data } = $props();
	let popularMovies = data.popularMoviesData;
	let newReleases = data.newReleasesData;
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<div class="container p-4 mx-auto mt-6 rounded-lg">
		<div class="flex items-start p-4 space-x-3 border border-blue-200 rounded-lg bg-blue-50">
			<div class="flex-1 text-blue-900">
				<div class="text-lg font-bold">For the best viewing experience without ads:</div>
				<ul class="mt-2 ml-6 space-y-1 list-disc">
					<li>
						On mobile devices, we recommend using <a
							href="https://play.google.com/store/apps/details?id=com.brave.browser&hl=en&pli=1"
							target="_blank"
							class="text-red-500 underline"
							>Brave Browser Android
						</a>
						or
						<a
							href="https://apps.apple.com/us/app/brave-browser-search-engine/id1052879175"
							target="_blank"
							class="text-red-500 underline">Brave Browser IOS</a
						>
					</li>
					<li>
						Please install uBlock Origin Extension for <a
							href="https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm?hl=en&pli=1"
							target="_blank"
							class="font-bold text-red-500 underline">Chrome</a
						>
						or
						<a
							href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
							target="_blank"
							class="font-bold text-red-500 underline"
							>Firefox
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>

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
