<script>
	import { page } from '$app/stores';
	let { data } = $props();
	let bollyhood_movie_data = data.bollyhood_movieData;
	let bollyhood_movie_id = $page.params.bollyhood_movie_id;

	let iframeSources = $state([
		// `https://embed.su/embed/movie/${bollyhood_movie_id}?autoPlay=true`,
		`https://vidsrc.cc/v3/embed/movie/${bollyhood_movie_id}?autoPlay=true`,
		`https://vidsrc.icu/embed/movie/${bollyhood_movie_id}`
		// `https://multiembed.mov/directstream.php?video_id=${movie_id}&tmdb=1`,
		// `https://multiembed.mov/?video_id=${movie_id}&tmdb=1`
	]);

	let selectedSource = $state(0);

	function changeSource(index) {
		selectedSource = index;
	}

	// window.addEventListener('message', (event) => {
	// 	if (event.origin !== 'https://vidsrc.cc') return;

	// 	if (event.data && event.data.type === 'PLAYER_EVENT') {
	// 		const { event: eventType, currentTime, duration } = event.data.data;
	// 		console.log(`Player ${eventType} at ${currentTime}s of ${duration}s`);
	// 	}
	// });

	// var video = document.getElementById('player1');

	// var videoStartTime = 0;
	// var durationTime = 0;

	// video.addEventListener(
	// 	'loadedmetadata',
	// 	function () {
	// 		videoStartTime = 2;
	// 		durationTime = 4;
	// 		this.currentTime = videoStartTime;
	// 	},
	// 	false
	// );
</script>

<div class="min-h-screen text-white bg-black">
	<div class="min-h-screen text-white bg-black">
		<div class="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
			<div class="container px-4 mx-auto mt-12 md:px-8">
				<div class="relative w-full overflow-hidden rounded-lg shadow-2xl aspect-video">
					<iframe
						src={iframeSources[selectedSource]}
						class="absolute w-full h-[60vh]"
						allowfullscreen
						loading="lazy"
						title="Movie Player"
					></iframe>
				</div>
			</div>
		</div>

		<!-- Centered Buttons -->
		<div class="flex justify-center gap-4 mt-4">
			{#each iframeSources as source, index}
				<button
					class={'px-4 py-2 text-sm font-semibold rounded-md ' +
						(index === selectedSource ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700')}
					onclick={() => changeSource(index)}
				>
					Server {index + 1}
				</button>
			{/each}
		</div>
	</div>

	<!-- Movie Details -->
	<div class="container px-4 py-8 mx-auto md:px-8 md:py-12">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Left Column -->
			<div class="lg:col-span-2">
				<div class="flex flex-col gap-6 md:flex-row">
					<img
						src={`https://image.tmdb.org/t/p/w500${bollyhood_movie_data.poster_path}`}
						alt="Movie Poster"
						class="w-40 rounded-lg shadow-lg md:w-48"
					/>

					<div class="flex-1">
						<h1 class="text-3xl font-bold md:text-4xl">
							{bollyhood_movie_data.original_title || bollyhood_movie_data.name}
						</h1>
						<p class="mt-2 text-gray-400">{bollyhood_movie_data.release_date}</p>
						<p class="mt-2 text-gray-300">{bollyhood_movie_data.overview}</p>
					</div>
				</div>

				<!-- Genres -->
				<div class="flex flex-wrap gap-2 mt-6">
					{#each bollyhood_movie_data.genres as genre}
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
						<dd>{bollyhood_movie_data.status}</dd>
					</div>
					<div>
						<dt class="text-gray-400">Original Language</dt>
						<dd>{bollyhood_movie_data.original_language}</dd>
					</div>
					<div>
						<dt class="text-gray-400">Production Companies</dt>
						<dd>
							{#each bollyhood_movie_data.production_companies as company, i (company.id)}
								<span
									>{company.name}{i < bollyhood_movie_data.production_companies.length - 1
										? ', '
										: ''}</span
								>
							{/each}
						</dd>
					</div>
					<div>
						<dt class="text-gray-400">Country of Origin</dt>
						<dd>
							{#each bollyhood_movie_data.production_countries as country, i (country.iso_3166_1)}
								<span
									>{country.name}{i < bollyhood_movie_data.production_countries.length - 1
										? ', '
										: ''}</span
								>
							{/each}
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</div>
