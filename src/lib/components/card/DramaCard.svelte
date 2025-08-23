<script>
	let { id, poster_path, name, vote_average, first_air_date, number_of_seasons } = $props();

	// Format rating with proper handling for missing values
	const formatRating = (rating) => {
		if (!rating || rating === 0) return "N/A";
		return Number(rating).toFixed(1);
	};

	// Get rating color based on score
	const getRatingColor = (rating) => {
		if (!rating || rating === 0) return "bg-gray-600";
		if (rating >= 8) return "bg-green-600";
		if (rating >= 6) return "bg-yellow-600";
		if (rating >= 4) return "bg-orange-600";
		return "bg-red-600";
	};

	// Format release year
	const getYear = (date) => {
		if (!date) return "";
		return new Date(date).getFullYear();
	};

	// Format seasons text
	const getSeasonsText = (seasons) => {
		if (!seasons || seasons === 0) return "";
		return seasons === 1 ? "1 Season" : `${seasons} Seasons`;
	};

	let rating = formatRating(vote_average);
	let ratingColor = getRatingColor(vote_average);
	let year = getYear(first_air_date);
	let seasonsText = getSeasonsText(number_of_seasons);
</script>

<div class="group relative w-full max-w-sm mx-auto">
	<!-- Main card container -->
	<div
		class="relative overflow-hidden bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 border border-gray-800/50"
	>
		<a href="/dramas/{id}" class="block text-white no-underline">
			<!-- Poster container with aspect ratio -->
			<div class="relative w-full aspect-[2/3] overflow-hidden">
				<img
					src={poster_path
						? `https://image.tmdb.org/t/p/w500/${poster_path}`
						: "https://images.unsplash.com/photo-1489599006549-b6f90d34e2d3?w=400&h=600&fit=crop&crop=center"}
					alt={name}
					class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>

				<!-- Gradient overlay -->
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				></div>

				<!-- Rating badge -->
				<div class="absolute top-3 right-3 z-10">
					<div
						class="flex items-center justify-center min-w-[48px] h-8 px-2 {ratingColor} rounded-full shadow-lg backdrop-blur-sm"
					>
						<span class="text-white text-sm font-bold flex items-center gap-1">
							{rating}
							{#if rating !== "N/A"}
								<svg class="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
							{/if}
						</span>
					</div>
				</div>

				<!-- Seasons badge (bottom left) -->
				{#if seasonsText}
					<div class="absolute bottom-3 left-3 z-10">
						<div class="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
							<span class="text-white text-xs font-medium flex items-center gap-1">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
									/>
								</svg>
								{seasonsText}
							</span>
						</div>
					</div>
				{/if}

				<!-- Play button overlay (appears on hover) -->
				<div
					class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				>
					<div
						class="bg-white/20 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300"
					>
						<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
							/>
						</svg>
					</div>
				</div>
			</div>

			<!-- Content section -->
			<div class="p-4 space-y-2">
				<!-- Title -->
				<h3
					class="text-white font-semibold text-base leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors duration-300"
				>
					{name}
				</h3>

				<!-- Series details -->
				<div class="flex items-center justify-between text-sm text-gray-400">
					{#if year}
						<span class="flex items-center gap-1">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							{year}
						</span>
					{/if}

					<!-- TV Series icon -->
					<span class="flex items-center gap-1">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						Series
					</span>
				</div>
			</div>
		</a>
	</div>

	<!-- Subtle glow effect -->
	<div
		class="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"
	></div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.aspect-\[2\/3\] {
		aspect-ratio: 2/3;
	}

	@supports not (aspect-ratio: 2/3) {
		.aspect-\[2\/3\] {
			padding-bottom: 150%;
		}
	}
</style>
