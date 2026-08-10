<script>
	import { page } from "$app/stores";
	import { toggleMovieBookmark, addToMovieHistory } from "$lib/remote/bookmarks.remote.js";
	import { isMovieBookmarkedLocal, addBookmarkLocal, removeBookmarkLocal } from "$lib/state/bookmarks.svelte.js";

	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { Heart, Bookmark } from "lucide-svelte";
	import { PersistedState } from "runed";
	import { Menu, X, Info } from "lucide-svelte";
	import MovieCard from "$lib/components/card/MovieCard.svelte";
	import { createProgressSync } from "$lib/player/watchProgress.js";


	let { data } = $props();

	let user = data?.user;
	let movie_data = data.movieData;
	let movie_id = data.movieData.id;
	let recommendation_data = data.recommendation_data;

	let iframeEl = $state();
	const progressSync = createProgressSync({
		type: "movie",
		getMeta: () => ({ tmdbId: movie_data.id }),
		isEnabled: () => !!user
	});

	let isBookmarked = $derived(isMovieBookmarkedLocal(movie_data.id));

	const safeMovieId = String(movie_id).trim();

	let isSidebarVisible = $state(false);

	function toggleSidebar() {
		isSidebarVisible = !isSidebarVisible;
	}

	let iframeSources = $state([
		`https://vidsrc.icu/embed/movie/${safeMovieId}`,
		`https://vidsrc.to/embed/movie/${safeMovieId}`,
		`https://vidsrc.cc/v2/embed/movie/${safeMovieId}?autoPlay=true`,
		`https://player.videasy.net/movie/${safeMovieId}`,
		`https://player.autoembed.cc/embed/movie/${safeMovieId}`,
		`https://111movies.com/movie/${safeMovieId}`,
		`https://vidjoy.pro/embed/movie/${safeMovieId}`,
		`https://mappletv.uk/watch/movie/${safeMovieId}`,
		`https://embed.rgshows.me/api/3/movie/?id=${safeMovieId}`,
		`https://vidfast.pro/movie/${safeMovieId}?autoPlay=true`,
		`https://embed.rgshows.me/api/2/movie/?id=${safeMovieId}`
	]);

	let selectedSource = $state(0);
	let isPlayerLoading = $state(true);

	function changeSource(index) {
		selectedSource = index;
		isPlayerLoading = true;
		progressSync.scheduleSeek(() => iframeEl, progressSync.getPosition());
	}

	function handleIframeLoad() {
		isPlayerLoading = false;
	}


	async function toggleBookmark() {
		if (!user) {
			toast.error("Please login to bookmark");
			return;
		}
		try {
			const result = await toggleMovieBookmark({
				id: movie_data.id,
				poster_path: movie_data.poster_path,
				title: movie_data.title,
				vote_average: movie_data.vote_average,
				release_date: movie_data.release_date,
				genre_ids: movie_data.genres ? movie_data.genres.map(g => g.id) : []
			});

			if (result.success) {
				if (result.action === 'added') {
					addBookmarkLocal('movie', movie_data.id);
					toast.success("Added to bookmark");
				} else {
					removeBookmarkLocal('movie', movie_data.id);
					toast.success("Removed from bookmark");
				}
			} else {
				toast.error(result.error || "Failed to toggle bookmark");
			}
		} catch (error) {
			console.error("Error toggling bookmark:", error);
		}
	}

	onMount(async () => {
		if (!user) return;
		try {
			await addToMovieHistory({
				id: movie_data.id,
				poster_path: movie_data.poster_path,
				title: movie_data.title,
				vote_average: movie_data.vote_average,
				release_date: movie_data.release_date,
				genre_ids: movie_data.genres ? movie_data.genres.map((g) => g.id) : []
			});
			await progressSync.loadAndSeek(() => iframeEl);
		} catch (error) {
			console.error("Error adding to watch history:", error);
		}
	});

	onMount(() => {
		progressSync.start();
		return () => progressSync.stop();
	});
</script>

<div class="flex flex-col min-h-screen bg-black text-white overflow-x-hidden">
	<!-- Main row: content-sized so the player and its controls always flow above the sections below -->
	<div
		class="movie-detail-hero flex flex-col lg:flex-row p-2 sm:p-4 md:p-6 gap-4 md:gap-6 lg:items-start"
	>
		<!-- Movie Details Sidebar (Desktop: always visible, Mobile: toggleable) -->
		<div
			class="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-20 lg:self-start order-2 lg:order-1
                    {isSidebarVisible ? 'block' : 'hidden'} lg:block"
		>
			<!-- Close button for mobile -->
			<div class="lg:hidden flex justify-between items-center mb-4">
				<h2 class="text-lg font-semibold">Movie Details</h2>
				<button
					onclick={toggleSidebar}
					class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
					aria-label="Close movie details"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Title & Release Date -->
			<div class="mb-4">
				<h1 class="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
					{movie_data.title || movie_data.original_title}
				</h1>
				<p class="text-gray-400 text-sm">{movie_data.release_date?.split("-")[0] || "N/A"}</p>
			</div>

			<!-- Mobile Layout -->
			<div class="lg:hidden mb-6">
				<div class="flex gap-3 sm:gap-4">
					<!-- Poster -->
					<div class="flex-shrink-0 w-24 sm:w-32">
						<img
							src={`https://image.tmdb.org/t/p/w500${movie_data.poster_path}`}
							alt={`${movie_data.title} Poster`}
							class="w-full rounded-lg shadow-lg border border-gray-700"
							loading="lazy"
						/>
					</div>

					<!-- Info -->
					<div class="flex-1 min-w-0">
						<button
							onclick={() => toggleBookmark()}
							class="w-full flex items-center justify-center gap-2 px-2 py-2 mb-3 text-xs font-medium rounded-lg bg-black border border-gray-700 hover:bg-gray-900 transition"
							aria-label={isBookmarked ? "Remove from Home" : "Add to Bookmark"}
						>
							<Bookmark
								size={16}
								color={isBookmarked ? "gold" : "white"}
								fill={isBookmarked ? "gold" : "none"}
							/>
							<span>{isBookmarked ? "Added" : "Add"}</span>
						</button>

						<!-- Genres -->
						<div class="bg-gray-900 rounded-lg p-2">
							<h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
								Genres
							</h4>
							<div class="flex flex-wrap gap-1">
								{#each movie_data.genres as genre (genre.id)}
									<span
										class="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300"
									>
										{genre.name}
									</span>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Overview (Full width) -->
				<div class="bg-gray-900 rounded-lg p-3 mt-3">
					<h3 class="text-base font-semibold mb-2">Overview</h3>
					<p class="text-gray-300 text-sm leading-relaxed line-clamp-5">{movie_data.overview}</p>
				</div>
			</div>

			<!-- Desktop Layout -->
			<div class="hidden lg:block">
				<img
					src={`https://image.tmdb.org/t/p/w500${movie_data.poster_path}`}
					alt={`${movie_data.title} Poster`}
					class="w-full h-auto rounded-lg shadow-lg border border-gray-700 mb-4"
					loading="lazy"
				/>

				<button
					onclick={toggleBookmark}
					class="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 text-sm font-medium rounded-lg bg-black border border-gray-700 hover:bg-gray-900 transition"
					aria-label={isBookmarked ? "Remove from bookmark" : "Add to bookmark"}
				>
					<Bookmark
						size={20}
						color={isBookmarked ? "gold" : "white"}
						fill={isBookmarked ? "gold" : "none"}
					/>
					<span>{isBookmarked ? "Added to Bookmark" : "Add to Bookmark"}</span>
				</button>

				<div class="bg-gray-900 rounded-lg p-4">
					<h3 class="text-lg font-semibold mb-3">Overview</h3>
					<p class="text-gray-300 text-sm leading-relaxed line-clamp-8">{movie_data.overview}</p>
				</div>

				<div class="bg-gray-900 rounded-lg p-4 mt-4">
					<h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Genres</h4>
					<div class="flex flex-wrap gap-2">
						{#each movie_data.genres as genre (genre.id)}
							<span
								class="px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded-full text-gray-300"
							>
								{genre.name}
							</span>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Video player then control bar, both in normal flow so the servers are never clipped -->
		<div class="flex-1 flex flex-col min-w-0 order-1 lg:order-2">
			<!-- Mobile Header with Toggle Button -->
			<div class="lg:hidden flex items-center justify-between mb-3 shrink-0">
				<h1 class="text-lg font-bold truncate">
					{movie_data.title || movie_data.original_title}
				</h1>
				<button
					onclick={toggleSidebar}
					class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
					aria-label="Show movie details"
				>
					<Info size={18} />
					<span>Details</span>
				</button>
			</div>

			<div class="movie-player-stack flex flex-col">
				<div class="movie-player-shell min-w-0">
					<div
						class="movie-player-frame relative rounded-lg overflow-hidden bg-black border-2 border-gray-700 shadow-lg"
					>
						{#key selectedSource}
							{#if isPlayerLoading}
								<div
									class="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/95"
								>
									<div class="flex flex-col items-center gap-3">
										<div
											class="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent sm:h-12 sm:w-12"
										></div>
										<p class="text-sm text-gray-400">Loading player…</p>
									</div>
								</div>
							{/if}
							<iframe
								bind:this={iframeEl}
								src={iframeSources[selectedSource]}
								class="absolute inset-0 block h-full w-full min-h-0 min-w-0 border-0"
								allow="encrypted-media; fullscreen; autoplay"
								allowfullscreen
								loading="lazy"
								title="Movie Player"
								referrerpolicy="no-referrer"
								onload={handleIframeLoad}
							></iframe>
						{/key}
					</div>
				</div>

			<div
				class="relative z-10 mt-2 sm:mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-900 border border-gray-800 rounded-lg shrink-0"
			>
				<div class="hidden sm:flex items-center justify-center sm:justify-start gap-2 shrink-0" aria-hidden="true"></div>

				<div
					class="flex items-center gap-2 min-w-0 w-full sm:w-auto sm:flex-1 sm:justify-end sm:max-w-[min(100%,42rem)] lg:max-w-none"
				>
					<span class="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">Server</span>
					<div
						class="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 min-w-0 flex-1 sm:flex-initial sm:justify-end"
					>
						{#each iframeSources as _, index}
							<button
								type="button"
								onclick={() => changeSource(index)}
								class={`shrink-0 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-[2rem] ${
									index === selectedSource
										? "bg-white text-black shadow"
										: "bg-gray-700 text-white hover:bg-gray-600"
								}`}
								aria-pressed={index === selectedSource}
							>
								{index + 1}
							</button>
						{/each}
					</div>
				</div>
			</div>
			</div>
		</div>
	</div>

	<!-- Recommendations Section -->
	{#if recommendation_data?.results && recommendation_data.results.length > 0}
		<div class="p-2 sm:p-4 md:p-6 pt-0">
			<div class="mb-6">
				<h2 class="text-xl sm:text-2xl font-bold mb-2">Recommended Movies</h2>
				<p class="text-gray-400 text-sm">More movies you might enjoy</p>
			</div>

			<!-- Horizontal Scrolling Grid -->
			<div class="relative">
				<div
					class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
				>
					{#each recommendation_data.results.slice(0, 12) as movie (movie.id)}
						<div class="flex-none w-48 sm:w-56">
							<MovieCard
								id={movie.id}
								poster_path={movie.poster_path}
								title={movie.title}
								vote_average={movie.vote_average}
								release_date={movie.release_date}
								genre_ids={movie.genre_ids}
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.movie-player-shell {
		width: 100%;
		min-width: 0;
	}

	.movie-player-frame {
		box-sizing: border-box;
		width: 100%;
		/* Cap the width by the height the viewport can spare (navbar, page padding
		   and the server bar), so the player scales down proportionally instead of
		   growing past the layout and overlapping the sections below. */
		max-width: min(100%, calc((100svh - 14rem) * 16 / 9));
		aspect-ratio: 16 / 9;
		margin-inline: auto;
	}

	.line-clamp-5 {
		display: -webkit-box;
		-webkit-line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.line-clamp-8 {
		display: -webkit-box;
		-webkit-line-clamp: 8;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Custom scrollbar styles */
	.scrollbar-thin {
		scrollbar-width: thin;
	}

	.scrollbar-track-gray-800::-webkit-scrollbar-track {
		background-color: #1f2937;
		border-radius: 9999px;
	}

	.scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
		background-color: #4b5563;
		border-radius: 9999px;
	}

	.scrollbar-thumb-gray-600::-webkit-scrollbar-thumb:hover {
		background-color: #6b7280;
	}

	::-webkit-scrollbar {
		height: 8px;
	}
</style>
