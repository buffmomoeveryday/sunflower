<script>
	import { goto } from "$app/navigation";
	import { toggleMovieBookmark } from "$lib/remote/bookmarks.remote.js";
	import { isMovieBookmarkedLocal, addBookmarkLocal, removeBookmarkLocal } from "$lib/state/bookmarks.svelte.js";
	import { watch } from "runed";
	import { toast } from "svelte-sonner";
	import { onMount } from "svelte";

	import { Bookmark } from "lucide-svelte";
	import { getMovieTrailer } from "../../remote/trailer.remote.js";
	import { browser } from "$app/environment";
	import { removeBgImage, setBgImage } from "$lib/state/bgImage.svelte";

	let { id, tmdb_id, poster_path, title, vote_average, release_date, genre_ids = [] } = $props();

	let isBookmarked = $derived(isMovieBookmarkedLocal(id));

	let showTrailer = $state(false);
	let trailer_key = $derived.by(async () => {
		if (showTrailer) {
			const key = await getMovieTrailer(id.toString());
			return key;
		}
		return "";
	});

	async function toggleBookmark() {
		try {
			const result = await toggleMovieBookmark({
				id,
				poster_path,
				title,
				vote_average,
				release_date,
				genre_ids
			});

			if (result.success) {
				if (result.action === 'added') {
					addBookmarkLocal('movie', id);
					toast.success("Added to bookmark");
				} else {
					removeBookmarkLocal('movie', id);
					toast.success("Removed from bookmark");
				}
			} else {
				toast.error(result.error || "Failed to toggle bookmark");
			}
		} catch (error) {
			console.error("Error toggling bookmark:", error);
		}
	}

	const formatRating = (rating) => {
		if (!rating || rating === 0) return "N/A";
		return Number(rating).toFixed(1);
	};

	const getRatingColor = (rating) => {
		if (!rating || rating === 0) return "bg-gray-600";
		if (rating >= 8) return "bg-green-600";
		if (rating >= 6) return "bg-yellow-600";
		if (rating >= 4) return "bg-orange-600";
		return "bg-red-600";
	};

	const getYear = (date) => {
		if (!date) return "";
		return new Date(date).getFullYear();
	};

	let rating = formatRating(vote_average);
	let ratingColor = getRatingColor(vote_average);
	let year = getYear(release_date);

	watch(
		() => showTrailer,
		async () => {
			if (showTrailer) {
				trailer_key = await getMovieTrailer(id.toString());
			}
		}
	);


</script>


<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative w-full max-w-sm mx-auto"
	onmouseenter={() => {
		setBgImage(`https://image.tmdb.org/t/p/original${poster_path}`);
	}}
	onmouseleave={() => {
		removeBgImage();
	}}
>
	<div
		class="relative overflow-hidden bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 border border-gray-800/50"
	>
		<div class="block text-white no-underline">
			<div class="absolute top-3 left-3 z-10">
				<button
					onclick={toggleBookmark}
					class="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full shadow-md transition-colors duration-300"
				>
					{#if isBookmarked}
						<Bookmark color="yellow" strokeWidth={3} fill="yellow" />
					{:else}
						<Bookmark />
					{/if}
				</button>
			</div>

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				onclick={() => {
					if (!browser) return;
					if (tmdb_id) {
						goto(`/movie/${tmdb_id}`);
					} else {
						goto(`/movie/${id}`);
					}
				}}
				class="relative w-full aspect-[2/3] overflow-hidden"
			>
				<img
					src="https://image.tmdb.org/t/p/w500/{poster_path}"
					alt={title}
					class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>

				<div
					class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				></div>

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

			<div class="p-4 space-y-3">
				<h3
					class="text-white font-semibold text-base leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors duration-300"
				>
					{title}
				</h3>
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

					<span class="flex items-center gap-1">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V4a1 1 0 011-1h6a1 1 0 011 1v0M7 8h10"
							/>
						</svg>
						Movie
					</span>
				</div>

				<!-- Buttons -->
				<div class="flex gap-2">
					<button
						type="button"
						class="flex-1 bg-pink-500 hover:bg-pink-700 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-md transition-colors duration-300"
						onclick={() => (showTrailer = true)}
					>
						Watch Trailer
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Trailer Modal -->
{#if showTrailer}
	<div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
		<div
			class="relative w-full max-w-3xl aspect-video bg-black rounded-2xl shadow-lg overflow-hidden"
		>
			<button
				class="absolute top-3 right-3 bg-black/60 hover:bg-black text-white rounded-full p-2"
				onclick={() => (showTrailer = false)}
			>
				✖
			</button>

			<iframe
				class="w-full h-full"
				src="https://www.youtube.com/embed/{trailer_key}?autoplay=1"
				title="Trailer"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			></iframe>
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

	@supports not (aspect-ratio: 2/3) {
		.aspect-\[2\/3\] {
			padding-bottom: 150%;
		}
	}
</style>
