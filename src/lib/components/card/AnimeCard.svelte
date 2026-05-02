<script>
	import { removeBgImage, setBgImage } from "$lib/state/bgImage.svelte";
	import { getCurrentUser } from "$lib/state/user.svelte.js";
	import { Bookmark } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import { toggleAnimeBookmark } from "$lib/remote/bookmarks.remote.js";
	import { isAnimeBookmarkedLocal, addBookmarkLocal, removeBookmarkLocal } from "$lib/state/bookmarks.svelte.js";
	import { onMount } from "svelte";
 
 
	let { id, tmdb_id, poster, name, vote, startDate, title, episodes, genres = [] } = $props();
 
	const formatRating = (rating) => {
		rating = rating / 10;
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
 
	let user = $derived(getCurrentUser());
  
	async function toggleBookmark() {
		if (!user) {
			toast.error("Please login to bookmark");
			return;
		}
		try {
			const result = await toggleAnimeBookmark({
				tmdb_id: id,
				poster,
				name,
				title,
				vote,
				start_date: startDate,
				episodes
			});
 
			if (result.success) {
				if (result.action === 'added') {
					addBookmarkLocal('anime', id);
					toast.success("Added to bookmark");
				} else {
					removeBookmarkLocal('anime', id);
					toast.success("Removed from bookmark");
				}
			} else {
				toast.error(result.error || "Failed to toggle bookmark");
			}
		} catch (e) {
			console.error("Bookmark error:", e);
		}
	}
 
	let rating = formatRating(vote);
	let ratingColor = getRatingColor(vote);
	let year = startDate || "N/A";
	let isBookmarked = $derived(isAnimeBookmarkedLocal(id));
 
 
 
 </script>
 
 
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
  	class="group relative w-full max-w-sm mx-auto h-full"
	onmouseenter={() => setBgImage(poster)}
	onmouseleave={() => { /* Persist background */ }}
  >
  	<button
  		onclick={() => {
  			toggleBookmark();
  		}}
  		class="absolute top-3 left-3 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition shadow-lg"
  		aria-label="Toggle Bookmark"
  	>
  		{#if isBookmarked}
  			<Bookmark color="gold" strokeWidth={3} fill="gold" />
  		{:else}
  			<Bookmark />
  		{/if}
  	</button>
  
  	<div
  		class="relative h-full flex flex-col overflow-hidden bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 border border-gray-800/50"
  	>
  		<a href="/anime/{id}" class="flex flex-col h-full text-white no-underline">
  			<div class="relative w-full aspect-[2/3] overflow-hidden flex-shrink-0">
 				<img
 					src={poster}
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
 
 				<div
 					class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
 				>
 					<h4 class="text-white text-sm font-semibold line-clamp-1">{name}</h4>
 					<p class="text-gray-300 text-xs mt-1">
 						{episodes}
 						{episodes === 1 ? "Episode" : "Episodes"}
 					</p>
 				</div>
 			</div>
 
  			<div class="p-4 flex flex-col flex-1 justify-between gap-3">
  				<div class="space-y-3">
  					<h3
  						class="text-white font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-blue-400 transition-colors duration-300"
  					>
  						{name}
  					</h3>
 					{#if genres.length > 0}
 						<div class="flex flex-wrap gap-1 mt-1 font-normal">
 							{#each genres.slice(0, 3) as genre}
 								<span class="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400">
 									{genre}
 								</span>
 							{/each}
 						</div>
 					{/if}
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
  							Anime
  						</span>
  					</div>
  				</div>
  			</div>
  		</a>
  	</div>
  </div>
 
 <style>
 	.line-clamp-1 {
 		display: -webkit-box;
 		-webkit-line-clamp: 1;
 		line-clamp: 1;
 		-webkit-box-orient: vertical;
 		overflow: hidden;
 	}
 
 
 	.line-clamp-2 {
 		display: -webkit-box;
 		-webkit-line-clamp: 2;
 		line-clamp: 2;
 		-webkit-box-orient: vertical;
 		overflow: hidden;
 	}
 
 
 	.aspect-\[2\/3\] {
 		aspect-ratio: 2 / 3;
 	}
 
 	@supports not (aspect-ratio: 2/3) {
 		.aspect-\[2\/3\] {
 			padding-bottom: 150%;
 		}
 	}
 </style>
