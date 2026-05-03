<script>
	import { toggleSeriesBookmark } from "$lib/remote/bookmarks.remote.js";
	import { isSeriesBookmarkedLocal, addBookmarkLocal, removeBookmarkLocal } from "$lib/state/bookmarks.svelte.js";

	import { Bookmark, Play } from "lucide-svelte";
	import { watch } from "runed";
	import { toast } from "svelte-sonner";
	import { onMount } from "svelte";
	import { getSeriesTrailer } from "$lib/remote/trailer.remote";
	import { removeBgImage, setBgImage } from "$lib/state/bgImage.svelte";
	import { getCurrentUser } from "$lib/state/user.svelte";

	let { tmdb_id, id, poster_path, name, vote_average, first_air_date, number_of_seasons, genre_ids = [] } =
		$props();
 
	import { getGenreName } from "$lib/state/genres.svelte.js";

	const formatRating = (rating) => (!rating || rating === 0 ? "N/A" : Number(rating).toFixed(1));

	const getRatingColor = (rating) => {
		if (!rating || rating === 0) return "bg-gray-600";
		if (rating >= 8) return "bg-green-600";
		if (rating >= 6) return "bg-yellow-500";
		if (rating >= 4) return "bg-orange-500";
		return "bg-red-600";
	};

	const getYear = (date) => (date ? new Date(date).getFullYear() : "");
	const getSeasonsText = (s) => (!s ? "" : s === 1 ? "1 Season" : `${s} Seasons`);

	let rating = formatRating(vote_average);
	let ratingColor = getRatingColor(vote_average);
	let year = getYear(first_air_date);
	let seasonsText = getSeasonsText(number_of_seasons);

	let isBookmarked = $derived(isSeriesBookmarkedLocal(tmdb_id || id));

	let showTrailer = $state(false);
	let trailerDetails = $state(null);
	let trailerReviews = $state([]);
	let trailerKey = $state("");

	let user = $derived(getCurrentUser());
 
	async function toggleBookmark() {
		if (!user) {
			toast.error("Please login to bookmark");
			return;
		}
		try {
			const result = await toggleSeriesBookmark({
				tmdb_id: tmdb_id || id,
				poster_path,
				name,
				vote_average,
				first_air_date,
				number_of_seasons: number_of_seasons || 1
			});

			if (result.success) {
				const finalId = tmdb_id || id;
				if (result.action === 'added') {
					addBookmarkLocal('series', finalId);
					toast.success("Added to bookmark");
				} else {
					removeBookmarkLocal('series', finalId);
					toast.success("Removed from bookmark");
				}
			} else {
				toast.error(result.error || "Failed to toggle bookmark");
			}
		} catch (e) {
			console.error("Bookmark error:", e);
		}
	}


	watch(
		() => showTrailer,
		async () => {
			if (showTrailer) {
				let { trailer, details, reviews } = await getSeriesTrailer(
					String(tmdb_id ?? id ?? "")
				);
				trailerKey = trailer;
				trailerDetails = details;
				trailerReviews = reviews;
			}
		}
	);



</script>

<svelte:window on:keydown={(e) => e.key === "Escape" && (showTrailer = false)} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative w-full max-w-sm mx-auto"
	onmouseenter={() => {
		setBgImage(`https://image.tmdb.org/t/p/original${poster_path}`);
	}}
	onmouseleave={() => {
		// Keep last image
	}}
>
	<div
		class="relative h-full flex flex-col overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-md border border-gray-800 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/40"
	>
		<button
			onclick={toggleBookmark}
			class="absolute top-3 left-3 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition"
			aria-label="Toggle Bookmark"
		>
			{#if isBookmarked}
				<Bookmark color="gold" strokeWidth={3} fill="gold" />
			{:else}
				<Bookmark />
			{/if}
		</button>

		<a href="/series/{tmdb_id ?? id}" class="flex flex-col h-full">
			<div class="relative aspect-[2/3] w-full overflow-hidden flex-shrink-0">
				<img
					src={poster_path
						? `https://image.tmdb.org/t/p/w500/${poster_path}`
						: "https://images.unsplash.com/photo-1489599006549-b6f90d34e2d3?w=400&h=600&fit=crop"}
					alt={name}
					class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
					loading="lazy"
				/>

				<!-- Overlay -->
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
				></div>

				<!-- Rating -->
				{#if rating}
					<div class="absolute top-3 right-3">
						<div
							class="flex items-center gap-1 px-2 h-8 rounded-full shadow-md text-white text-sm font-bold {ratingColor}"
						>
							{rating}
						</div>
					</div>
				{/if}

				<!-- Seasons -->
				{#if seasonsText}
					<div
						class="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full text-xs text-white shadow-md"
					>
						{seasonsText}
					</div>
				{/if}

				<!-- Play overlay -->
				<div
					class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					<button
						onclick={() => (showTrailer = true)}
						class="bg-purple-600/80 hover:bg-purple-700 p-4 rounded-full backdrop-blur-md transition"
						aria-label="Watch Trailer"
					>
						<Play class="w-8 h-8 text-white" />
					</button>
				</div>
			</div>
		</a>

		<!-- Content -->
		<div class="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3 text-white">
			<div class="space-y-2 sm:space-y-3">
				<h3
					class="font-semibold text-base sm:text-lg leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-purple-400 transition"
				>
					{name}
				</h3>
				{#if genre_ids.length > 0}
					<div class="flex flex-wrap gap-1 mt-1 font-normal">
						{#each genre_ids.slice(0, 3) as gid}
							{#if getGenreName(gid, 'tv')}
								<span class="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400">
									{getGenreName(gid, 'tv')}
								</span>
							{/if}
						{/each}
					</div>
				{/if}
				<div class="flex items-center justify-between text-xs text-gray-400 font-normal">
					{#if year}
						<span>{year}</span>
					{/if}
					<span>Series</span>
				</div>
			</div>
 
			<button
				type="button"
				class="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl shadow-md transition"
				onclick={() => (showTrailer = true)}
			>
				Watch Trailer
			</button>
		</div>
	</div>
</div>

<!-- Trailer Modal -->
{#if showTrailer}
	<div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="relative w-full max-w-6xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
			<!-- Close Button -->
			<button
				class="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors z-10"
				onclick={() => (showTrailer = false)}
				aria-label="Close Trailer"
			>
				✖
			</button>

			<!-- Trailer -->
			<div class="aspect-video bg-black">
				<iframe
					class="w-full h-full"
					src="https://www.youtube.com/embed/{trailerKey}?autoplay=1"
					title="Trailer"
					frameborder="0"
					allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>

			<!-- Content Area -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
				<!-- Description -->
				<div class="md:col-span-2 text-white space-y-4">
					{#if trailerDetails}
						<h2 class="text-2xl font-bold">{trailerDetails.name}</h2>
						<p class="text-gray-300 leading-relaxed">{trailerDetails.overview}</p>
						<div class="text-sm text-gray-400 flex gap-4 flex-wrap">
							<span>First Air: {trailerDetails.first_air_date}</span>
							<span>Seasons: {trailerDetails.number_of_seasons}</span>
							<span>Episodes: {trailerDetails.number_of_episodes}</span>
						</div>
					{/if}
				</div>

				<!-- Reviews -->
				<div class="bg-gray-800/50 p-4 rounded-lg flex flex-col">
					<h3 class="text-lg font-semibold text-white mb-4 text-center">Reviews</h3>
					{#if trailerReviews.length > 0}
						<div class="overflow-y-auto max-h-72 space-y-4 flex-1">
							{#each trailerReviews as review}
								<div class="bg-gray-800 p-4 rounded-lg">
									<div class="flex items-center justify-center mb-3">
										<div
											class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
										>
											{review.author.charAt(0).toUpperCase()}
										</div>
									</div>
									<p class="text-sm text-gray-200 italic line-clamp-4 text-center mb-2">
										"{review.content}"
									</p>
									<p class="text-xs text-gray-400 text-center font-medium">– {review.author}</p>
									{#if review.author_details?.rating}
										<div class="flex items-center justify-center mt-2">
											<span class="text-yellow-400 text-xs"
												>★ {review.author_details.rating}/10</span
											>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="flex-1 flex items-center justify-center text-center text-gray-400">
							<div>
								<div class="text-4xl mb-2">📝</div>
								<p class="text-sm">No reviews available</p>
								<p class="text-xs text-gray-500 mt-1">Be the first to share your thoughts!</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.aspect-\[2\/3\] {
		aspect-ratio: 2/3;
	}
</style>
