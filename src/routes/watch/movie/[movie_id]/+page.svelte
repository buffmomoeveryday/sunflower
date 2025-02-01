<script>
	import { page } from '$app/stores';
	let { data } = $props();
	let movie_data = data.movieData;
	let movie_id = $page.params.movie_id;

	let iframeSources = $state([
		`https://vidsrc.dev/embed/movie/${movie_id}`,
		`https://vidsrc.icu/embed/movie/${movie_id}`,
		`https://vidsrc.cc/v3/embed/movie/${movie_id}?autoPlay=true`,
		`https://embed.su/embed/movie/${movie_id}?autoPlay=true`,
		`https://vidsrc.to/embed/movie/${movie_id}`
	]);

	let selectedSource = $state(0);

	function changeSource(index) {
		selectedSource = index;
	}
</script>

<div class="min-h-screen text-white bg-black">
	<div class="relative w-full overflow-hidden">
		<div class="container px-4 mx-auto mt-8 md:px-8">
			<div class="relative w-full rounded-lg shadow-2xl aspect-video">
				<iframe
					src={iframeSources[selectedSource]}
					class="absolute w-full h-full"
					allowfullscreen
					loading="lazy"
					title="Movie Player"
				></iframe>
			</div>
		</div>
	</div>

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

	<!-- Movie Details -->
	<div class="container px-4 py-8 mx-auto md:px-8 md:py-12">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Left Column -->
			<div class="lg:col-span-2">
				<div class="flex flex-col gap-6 md:flex-row">
					<img
						src={`https://image.tmdb.org/t/p/w500${movie_data.poster_path}`}
						alt="Movie Poster"
						class="w-40 rounded-lg shadow-lg md:w-48"
					/>

					<div class="flex-1">
						<h1 class="text-3xl font-bold md:text-4xl">
							{movie_data.original_title || movie_data.name}
						</h1>
						<p class="mt-2 text-gray-400">{movie_data.release_date}</p>
						<p class="mt-2 text-gray-300">{movie_data.overview}</p>
					</div>
				</div>

				<!-- Genres -->
				<div class="flex flex-wrap gap-2 mt-6">
					{#each movie_data.genres as genre}
						<span class="px-3 py-1 text-sm bg-gray-800 rounded-full hover:bg-gray-700">
							{genre.name}
						</span>
					{/each}
				</div>
			</div>

			<!-- Right Column: Production Details -->
			<div class="p-6 bg-gray-900 rounded-lg shadow-md">
				<h3 class="mb-4 text-lg font-semibold">Production Details</h3>
				<dl class="space-y-2 text-sm">
					<div>
						<dt class="text-gray-400">Status</dt>
						<dd>{movie_data.status}</dd>
					</div>
					<div>
						<dt class="text-gray-400">Original Language</dt>
						<dd>{movie_data.original_language}</dd>
					</div>
					<div>
						<dt class="text-gray-400">Production Companies</dt>
						<dd>
							{#each movie_data.production_companies as company, i (company.id)}
								<span
									>{company.name}{i < movie_data.production_companies.length - 1 ? ', ' : ''}</span
								>
							{/each}
						</dd>
					</div>
					<div>
						<dt class="text-gray-400">Country of Origin</dt>
						<dd>
							{#each movie_data.production_countries as country, i (country.iso_3166_1)}
								<span
									>{country.name}{i < movie_data.production_countries.length - 1 ? ', ' : ''}</span
								>
							{/each}
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</div>
