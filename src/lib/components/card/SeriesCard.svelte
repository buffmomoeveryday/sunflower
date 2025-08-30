<script>
	import { db } from "$lib/db/db";
	import { Bookmark } from "lucide-svelte";
	import { watch } from "runed";
	import { onMount } from "svelte";

	let { tmdb_id, poster_path, name, vote_average, first_air_date, number_of_seasons } = $props();

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

	let showTrailer = $state(false);
	let isBookmarked = $state(false);
	let trailerKey = $state("");

	async function toggleBookmark() {
		try {
			let marked = await db.series_bookmark.where("tmdb_id").equals(tmdb_id).first();
			if (marked) {
				await db.series_bookmark.where("tmdb_id").equals(tmdb_id).delete();
				isBookmarked = false;
			} else {
				await db.series_bookmark.add({
					tmdb_id: tmdb_id,
					poster_path: poster_path,
					name: name,
					vote_average: vote_average,
					first_air_date: first_air_date,
					number_of_seasons: number_of_seasons
				});
				isBookmarked = true;
			}
		} catch (e) {
			console.error("Bookmark error:", e);
		}
	}

	let trailerDetails = $state(null);
	let trailerReviews = $state([]);

	$effect(async () => {
		if (showTrailer) {
			const url = `/api/series/trailer?tmdb_id=${tmdb_id}`;
			const data = await fetch(url).then((r) => r.json());

			if (data.success) {
				trailerKey = data.key;
				trailerDetails = data.details;
				trailerReviews = data.reviews;
			}
		}
	});

	onMount(async () => {
		try {
			let book = await db.series_bookmark.where("tmdb_id").equals(tmdb_id).first();
			if (book) isBookmarked = true;
		} catch (e) {
			console.error("Bookmark check error:", e);
		}
	});
</script>

<svelte:window on:keydown={(e) => e.key === "Escape" && (showTrailer = false)} />

<!-- Card -->
<div class="group relative w-full max-w-sm mx-auto">
	<div
		class="relative overflow-hidden rounded-2xl bg-gray-900/80 backdrop-blur-md border border-gray-800 shadow-md transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/30"
	>
		<!-- Bookmark -->
		<button
			onclick={toggleBookmark}
			class="absolute top-3 left-3 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
		>
			{#if isBookmarked}
				<Bookmark color="yellow" strokeWidth={3} fill="yellow" />
			{:else}
				<Bookmark />
			{/if}
		</button>

		<!-- Poster -->
		<a href="/series/{tmdb_id}" class="block">
			<div class="relative aspect-[2/3] w-full overflow-hidden">
				<img
					src={poster_path
						? `https://image.tmdb.org/t/p/w500/${poster_path}`
						: "https://images.unsplash.com/photo-1489599006549-b6f90d34e2d3?w=400&h=600&fit=crop"}
					alt={name}
					class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					loading="lazy"
				/>

				<!-- Overlay gradient -->
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
				></div>

				<!-- Rating -->
				<div class="absolute top-3 right-3">
					<div
						class="flex items-center gap-1 px-2 h-8 rounded-full shadow-md text-white text-sm font-bold {ratingColor}"
					>
						{rating}
						{#if rating !== "N/A"}
							<svg class="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
								/>
							</svg>
						{/if}
					</div>
				</div>

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
					<div class="bg-white/20 p-4 rounded-full backdrop-blur-sm">
						<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
							/>
						</svg>
					</div>
				</div>
			</div>
		</a>

		<!-- Content -->
		<div class="p-4 space-y-2">
			<h3
				class="text-white font-semibold text-base leading-tight line-clamp-2 group-hover:text-purple-400 transition"
			>
				{name}
			</h3>

			<div class="flex items-center justify-between text-xs text-gray-400">
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

			<button
				type="button"
				class="w-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold py-2 rounded-xl shadow-md transition"
				onclick={() => (showTrailer = true)}
			>
				Watch Trailer
			</button>
		</div>
	</div>
</div>

<!-- Trailer Modal -->
{#if showTrailer}
	<div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
		<div class="relative w-full max-w-6xl bg-gray-900 rounded-xl overflow-hidden shadow-lg">
			<!-- Close Button -->
			<button
				class="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors z-10"
				onclick={() => (showTrailer = false)}>✖</button
			>

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

			<!-- Content Area: Description (left) + Reviews (right) -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
				<!-- Description (takes 2/3 width on large screens) -->
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

				<!-- Reviews Sidebar (takes 1/3 width on large screens) -->
				<div class="bg-gray-800/50 p-4 rounded-lg flex flex-col">
					<h3 class="text-lg font-semibold text-white mb-4 text-center">Reviews</h3>

					{#if trailerReviews.length > 0}
						<div class="overflow-y-auto max-h-72 space-y-4 flex-1">
							{#each trailerReviews as review}
								<div class="bg-gray-800 p-4 rounded-lg">
									<div class="flex items-center justify-center mb-3">
										<div
											class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
										>
											{review.author.charAt(0).toUpperCase()}
										</div>
									</div>
									<p class="text-sm text-gray-200 italic line-clamp-4 text-center mb-2">
										"{review.content}"
									</p>
									<p class="text-xs text-gray-400 text-center font-medium">
										– {review.author}
									</p>
									{#if review.author_details?.rating}
										<div class="flex items-center justify-center mt-2">
											<span class="text-yellow-400 text-xs">
												★ {review.author_details.rating}/10
											</span>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<div class="flex-1 flex items-center justify-center">
							<div class="text-center">
								<div class="text-4xl text-gray-600 mb-2">📝</div>
								<p class="text-sm text-gray-400">No reviews available</p>
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
