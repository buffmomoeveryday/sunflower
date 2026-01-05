<script>
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { PersistedState } from "runed";
	import {
		ChevronLeft,
		ChevronRight,
		Play,
		Calendar,
		Star,
		Clock,
		Info,
		Menu,
		X,
		Heart
	} from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import { toggleAnimeBookmark, addToAnimeHistory } from "$lib/remote/bookmarks.remote.js";
	import { isAnimeBookmarkedLocal, addBookmarkLocal, removeBookmarkLocal } from "$lib/state/bookmarks.svelte.js";



	let { data } = $props();

	let anime_data = data.anime_data;
	let anime_id = data.anime_id;

	const dub = new PersistedState(`dub_${anime_id}`, 0);
	const episode = new PersistedState(`episode_${anime_id}`, 1);
	const selectedSource = new PersistedState(`selectedSource_${anime_id}`, 0);
	const lang = new PersistedState(`land_${anime_id}`, "dub");
	const iframeKey = new PersistedState(`iframekey_${anime_id}`, 0);

	let isPlayerLoading = $state(true);
	let isSidebarVisible = $state(false);
	let user = data?.user;

	let iframeSources = $derived([
		`https://vidsrc.cc/v2/embed/anime/ani${anime_id}/${episode.current}/${lang.current}`,
		`https://player.videasy.net/anime/${anime_id}/${episode.current}?dub=${dub.current ? true : false}`
	]);

	let chunkSize = 50;
	let totalDropdowns = Math.ceil(anime_data.episodes / chunkSize);
	let dropdownRanges = Array.from({ length: totalDropdowns }, (_, i) => {
		const start = i * chunkSize + 1;
		const end = Math.min((i + 1) * chunkSize, anime_data.episodes);
		return {
			label: `${start} - ${end}`,
			value: i + 1
		};
	});
	let dropdownIndex = $state(0);

	function changeLang() {
		if (dub.current) {
			lang.current = "sub";
			dub.current = false;
		} else {
			lang.current = "dub";
			dub.current = true;
		}
		iframeKey.current++;
		isPlayerLoading = true;
	}

	function changeSource(index) {
		selectedSource.current = index;
		iframeKey.current++;
		isPlayerLoading = true;
	}

	function changeEpisode(newEpisode) {
		episode.current = newEpisode;
		iframeKey.current++;
		isPlayerLoading = true;
	}

	function handleIframeLoad() {
		isPlayerLoading = false;
	}

	function toggleSidebar() {
		isSidebarVisible = !isSidebarVisible;
	}

	let isBookmarked = $derived(isAnimeBookmarkedLocal(anime_id));

	async function toggleBookmark() {
		try {
			const result = await toggleAnimeBookmark({
				tmdb_id: anime_id,
				poster: anime_data.coverImage.extraLarge || anime_data.coverImage.large,
				name: anime_data.title.userPreferred || anime_data.title.romaji || anime_data.title.english,
				title: anime_data.title.english || anime_data.title.romaji || "",
				vote: anime_data.averageScore || 0,
				start_date: `${anime_data.startDate.year}-${anime_data.startDate.month}-${anime_data.startDate.day}`,
				episodes: anime_data.episodes || 0
			});

			if (result.success) {
				if (result.action === 'added') {
					addBookmarkLocal('anime', anime_id);
					toast.success("Added to bookmark");
				} else {
					removeBookmarkLocal('anime', anime_id);
					toast.success("Removed from bookmark");
				}
			} else {
				toast.error(result.error || "Failed to toggle bookmark");
			}
		} catch (e) {
			console.error("Bookmark error:", e);
		}
	}

	onMount(async () => {


		setTimeout(async () => {
			try {
				await addToAnimeHistory({
					tmdb_id: anime_id,
					poster: anime_data.coverImage.extraLarge || anime_data.coverImage.large,
					name: anime_data.title.userPreferred || anime_data.title.romaji || anime_data.title.english,
					title: anime_data.title.english || anime_data.title.romaji || "",
					vote: anime_data.averageScore || 0,
					start_date: `${anime_data.startDate.year}-${anime_data.startDate.month}-${anime_data.startDate.day}`,
					episodes: anime_data.episodes || 0
				});
			} catch (error) {
				console.error("Error adding to watch history:", error);
			}
		}, 5000);
	});

</script>

<div class="flex flex-col min-h-screen text-white bg-black">
	<!-- Mobile Header -->
	<div class="flex items-center justify-between p-4 bg-black border-b border-gray-800 md:hidden">
		<button
			onclick={toggleSidebar}
			class="p-2 text-white transition-colors duration-200 hover:text-gray-300"
		>
			{#if isSidebarVisible}
				<X size={24} />
			{:else}
				<Menu size={24} />
			{/if}
		</button>
		<h1 class="text-lg font-bold truncate">
			{anime_data.title.userPreferred || anime_data.title.romaji || anime_data.title.english}
		</h1>
		<!-- Placeholder for Watchlist Button if user data is available -->
		{#if user}
			<button
				onclick={toggleBookmark}
				class="p-2 transition-colors duration-200 hover:bg-gray-800 rounded-lg"
			>
				<Heart
					size={20}
					color={isBookmarked ? "#fb2c36" : "white"}
					fill={isBookmarked ? "#fb2c36" : "none"}
				/>

			</button>
		{/if}
	</div>

	<div class="flex flex-1 overflow-hidden">
		<!-- Sidebar (Episode List) -->
		<div
			class={`
      fixed inset-y-0 left-0 z-50 w-80 bg-black border-r border-gray-800 transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 md:w-1/4 lg:w-1/5 md:h-full
      ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}
    `}
		>
			<div class="flex flex-col h-full">
				<!-- Sidebar Header (Mobile) -->
				<div class="flex items-center justify-between p-4 border-b border-gray-800 md:hidden">
					<h2 class="text-lg font-bold">Episodes</h2>
					<button
						onclick={toggleSidebar}
						class="p-1 text-white transition-colors duration-200 hover:text-gray-300"
					>
						<X size={20} />
					</button>
				</div>
				<div class="flex-1 p-4 overflow-y-auto">
					<!-- Audio Selection -->
					<div class="mb-6">
						<h3
							class="flex items-center gap-2 mb-3 text-sm font-bold text-white uppercase tracking-wide"
						>
							<Play size={16} />
							Audio
						</h3>
						<div class="flex rounded-lg overflow-hidden">
							<button
								class={`flex-1 px-4 py-2 text-sm font-medium ${!dub.current ? "bg-white text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
								onclick={() => {
									if (dub.current) changeLang();
								}}
							>
								Subtitle
							</button>
							<button
								class={`flex-1 px-4 py-2 text-sm font-medium ${dub.current ? "bg-white text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
								onclick={() => {
									if (!dub.current) changeLang();
								}}
							>
								Dubbed
							</button>
						</div>
					</div>

					<!-- Episodes List -->
					<div class="mb-4">
						<h3
							class="flex items-center gap-2 mb-3 text-sm font-bold text-white uppercase tracking-wide"
						>
							<Clock size={16} />
							Episodes ({anime_data.episodes})
						</h3>
						<!-- Applied no-scrollbar class here -->
						<div
							class="grid grid-cols-5 gap-2 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar"
						>
							{#each Array(anime_data.episodes) as _, i}
								<button
									class={`aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
										episode.current === i + 1
											? "bg-white text-black"
											: "bg-gray-700 text-gray-300 hover:bg-gray-600"
									}`}
									onclick={() => changeEpisode(i + 1)}
								>
									{i + 1}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="flex-1 flex flex-col md:w-3/4 lg:w-4/5 min-h-0">
			<!-- Video Player Section -->
			<div class="flex-1 flex flex-col p-4 md:p-6 min-h-0">
				<!-- Title and Context -->
				<div class="mb-6 flex-shrink-0">
					<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">
						<span>Anime</span>
						<span class="text-gray-600">/</span>
						<span>{anime_data.format || 'Series'}</span>
						<span class="text-gray-600">/</span>
						<span class="text-gray-300">Episode {episode.current}</span>
					</div>
					<h2 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
						{anime_data.title.userPreferred || anime_data.title.romaji || anime_data.title.english}
					</h2>
				</div>
				<!-- Video Player Container -->
				<div class="relative w-full aspect-video mb-6 rounded-2xl overflow-hidden bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 ring-1 ring-white/10">
					{#key `${selectedSource.current}-${episode.current}-${iframeKey.current}`}
						<!-- Loading Skeleton -->
						{#if isPlayerLoading}
							<div class="absolute inset-0 bg-gray-950/90 backdrop-blur-md flex items-center justify-center z-10 transition-all duration-500">
								<div class="flex flex-col items-center gap-5">
									<div class="relative">
										<div class="w-20 h-20 border-2 border-white/5 rounded-full"></div>
										<div class="absolute inset-0 w-20 h-20 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
										<div class="absolute inset-0 flex items-center justify-center">
											<Play size={24} class="text-blue-500 animate-pulse" fill="currentColor" />
										</div>
									</div>
									<div class="text-center">
										<p class="text-white font-bold text-lg tracking-widest uppercase mb-1">Buffering</p>
										<p class="text-white/40 text-xs font-medium">Preparing Episode {episode.current}</p>
									</div>
								</div>
							</div>
						{/if}
						<!-- Video Player -->
						<iframe
							src={iframeSources[selectedSource.current]}
							class="absolute inset-0 w-full h-full"
							allowfullscreen
							loading="lazy"
							title="Anime Player"
							onload={handleIframeLoad}
							scrolling="no"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						></iframe>
					{/key}
				</div>
				<!-- Player Controls -->
				<div
					class="flex flex-wrap items-center justify-between gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl flex-shrink-0 backdrop-blur-sm shadow-xl"
				>
					<!-- Server Selection -->
					<div class="flex items-center gap-4">
						<span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Server</span>
						<div class="flex gap-2">
							{#each iframeSources as source, index}
								<button
									class={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
										index === selectedSource.current
											? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105"
											: "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
									}`}
									onclick={() => changeSource(index)}
								>
									{index + 1}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Anime Information - Scrollable -->
			<!-- Applied no-scrollbar class here -->
			<div class="p-4 md:p-6 space-y-6 overflow-y-auto flex-shrink-0 max-h-64 no-scrollbar">
				<!-- Anime Details -->
				<div class="p-6 bg-gray-900 rounded-lg">
					<h3 class="flex items-center gap-2 mb-4 text-xl font-bold">
						<Info size={20} />
						About {anime_data.title.userPreferred ||
							anime_data.title.romaji ||
							anime_data.title.english}
					</h3>
					<p class="text-gray-300 mb-6 leading-relaxed">
						{@html anime_data.description
							? anime_data.description.replace(/<br\s*\/?>/gi, " ")
							: "No description available."}
					</p>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div>
							<h4
								class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Star size={14} />
								Rating
							</h4>
							<div class="flex items-center gap-2">
								<Star size={16} class="text-yellow-500" fill="currentColor" />
								<span class="text-white font-medium"
									>{anime_data.averageScore
										? (anime_data.averageScore / 10).toFixed(1)
										: "N/A"}</span
								>
								<span class="text-gray-400">/ 10</span>
							</div>
						</div>
						<div>
							<h4
								class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Calendar size={14} />
								Season
							</h4>
							<p class="text-white">{anime_data.season} {anime_data.seasonYear}</p>
						</div>
						<div>
							<h4
								class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide"
							>
								<Clock size={14} />
								Format
							</h4>
							<p class="text-white">{anime_data.format} ({anime_data.duration || 24} min)</p>
						</div>
					</div>
					<div class="mt-6">
						<h4 class="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">Genres</h4>
						<div class="flex flex-wrap gap-2">
							{#each anime_data.genres as genre}
								<span
									class="px-3 py-1 text-sm bg-gray-800 border border-gray-700 rounded-full text-gray-300"
								>
									{genre}
								</span>
							{/each}
						</div>
					</div>
				</div>

				<!-- Relations (Recommended) -->
				{#if anime_data.relations && anime_data.relations.length > 0}
					<div class="p-6 bg-gray-900 rounded-lg">
						<h3 class="flex items-center gap-2 mb-4 text-xl font-bold">
							<Star size={20} />
							Recommended
						</h3>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							{#each anime_data.relations.slice(0, 4) as relation}
								<a href={`/anime/${relation.id}`} class="group">
									<div
										class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
									>
										{#if relation.coverImage?.medium}
											<img
												src={relation.coverImage.medium}
												alt={relation.title?.userPreferred ||
													relation.title?.english ||
													relation.title?.romaji ||
													"Anime Cover"}
												class="w-full h-32 object-cover"
												loading="lazy"
											/>
										{/if}
										<div class="p-3">
											<p class="text-sm font-medium line-clamp-2">
												{relation.title?.userPreferred ||
													relation.title?.english ||
													relation.title?.romaji ||
													"Unknown Title"}
											</p>
										</div>
									</div>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Characters -->
				{#if anime_data.characters?.edges && anime_data.characters.edges.length > 0}
					<div class="p-6 bg-gray-900 rounded-lg">
						<h3 class="flex items-center gap-2 mb-4 text-xl font-bold">Characters</h3>
						<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
							{#each anime_data.characters.edges.slice(0, 12) as charEdge}
								<div
									class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
								>
									{#if charEdge.node?.image?.large}
										<img
											src={charEdge.node.image.large}
											alt={charEdge.node.name?.full || "Character"}
											class="w-full h-32 object-cover"
											loading="lazy"
										/>
									{/if}
									<div class="p-3">
										<p class="text-sm font-medium line-clamp-2">
											{charEdge.node?.name?.full || "Unknown"}
										</p>
										<p class="text-xs text-gray-400 mt-1">{charEdge.role}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Sidebar Overlay for Mobile -->
{#if isSidebarVisible}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="button"
		tabindex="0"
		class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
		onclick={toggleSidebar}
	></div>
{/if}

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

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
