<script>
	import { onMount } from "svelte";
	import { getSports, getMatches } from "$lib/remote/sports.remote";
	import { Play, Trophy, Calendar, Clock, ChevronRight, Search, X } from "lucide-svelte";
	import { fade, fly } from "svelte/transition";

	let searchQuery = $state("");
	let sportsCategories = $state([]);
	let matches = $state([]);
	let selectedCategory = $state("live");
	let loading = $state(true);

	let filteredMatches = $derived(
		matches.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	async function loadCategories() {
		sportsCategories = await getSports();
	}

	async function loadMatches(category) {
		loading = true;
		matches = await getMatches(category);
		loading = false;
	}

	onMount(async () => {
		await loadCategories();
		await loadMatches(selectedCategory);
	});

	function handleCategoryChange(id) {
		selectedCategory = id;
		loadMatches(id);
	}

	function formatTime(timestamp) {
		return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}

	function formatDate(timestamp) {
		return new Date(timestamp).toLocaleDateString([], { month: "short", day: "numeric" });
	}
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
	<!-- Hero Section -->
	<div class="mb-12 text-center">
		<h1 class="text-4xl md:text-6xl font-black mb-4 text-white tracking-tight">
			Live <span class="text-amber-500">Sports</span> 🏆
		</h1>
		<p class="text-gray-400 max-w-2xl mx-auto text-lg">
			Catch all your favorite matches and live events from across the world.
		</p>
	</div>

	<!-- Search Bar -->
	<div class="max-w-xl mx-auto mb-10">
		<div class="relative group">
			<div
				class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-500 transition-colors"
			>
				<Search class="w-5 h-5" />
			</div>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search for matches, teams, or competitions..."
				class="w-full bg-gray-900/50 border border-gray-800 text-white pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-600 shadow-xl"
			/>
			{#if searchQuery}
				<button
					onclick={() => (searchQuery = "")}
					class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
				>
					<X class="w-5 h-5" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Category Navigation -->
	<div class="flex overflow-x-auto pb-6 mb-10 no-scrollbar gap-3">
		<button
			onclick={() => handleCategoryChange("live")}
			class="flex-shrink-0 px-6 py-2.5 rounded-xl font-bold transition-all {selectedCategory ===
			'live'
				? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
				: 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-white hover:bg-gray-800'}"
		>
			Live Now
		</button>
		{#each sportsCategories as sport}
			<button
				onclick={() => handleCategoryChange(sport.id)}
				class="flex-shrink-0 px-6 py-2.5 rounded-xl font-bold capitalize transition-all {selectedCategory ===
				sport.id
					? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
					: 'bg-gray-900 border border-gray-800 text-gray-500 hover:text-white hover:bg-gray-800'}"
			>
				{sport.name}
			</button>
		{/each}
	</div>

	<!-- Matches Grid -->
	{#if loading}
		<div class="flex flex-col items-center justify-center py-20">
			<div
				class="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"
			></div>
			<p class="text-gray-500 animate-pulse font-medium">Loading matches...</p>
		</div>
	{:else if filteredMatches.length === 0}
		<div class="flex flex-col items-center justify-center py-32 text-center" in:fade>
			<div class="bg-gray-900/50 p-8 rounded-full mb-6 border border-gray-800">
				<Search class="w-16 h-16 text-gray-700" />
			</div>
			<p class="text-2xl font-black text-white mb-2">No matches found</p>
			<p class="text-gray-500">Try searching for something else or change the category.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" in:fade>
			{#each filteredMatches as match (match.id)}
				<a
					href="/sports/{match.sources[0]?.source}/{match.sources[0]?.id}"
					class="group relative bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10"
				>
					<!-- Match Image -->
					<div class="aspect-video w-full overflow-hidden relative">
						<img
							src={match.poster ? `https://streamed.pk${match.poster}` : "/placeholder-sports.jpg"}
							alt={match.title}
							class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80"
						></div>

						{#if selectedCategory === "live"}
							<div
								class="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg animate-pulse"
							>
								<span class="w-1.5 h-1.5 bg-white rounded-full"></span>
								Live
							</div>
						{/if}

						<div
							class="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-gray-300 flex items-center gap-1.5"
						>
							<Clock class="w-3 h-3" />
							{formatTime(match.date)}
						</div>
					</div>

					<!-- Match Info -->
					<div class="p-5">
						<div class="flex items-center gap-2 mb-3">
							<span
								class="text-[10px] font-black uppercase tracking-widest text-amber-500 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20"
							>
								{match.category}
							</span>
							<span class="text-[10px] font-bold text-gray-500 flex items-center gap-1">
								<Calendar class="w-3 h-3" />
								{formatDate(match.date)}
							</span>
						</div>

						<h3
							class="text-xl font-bold text-white mb-6 line-clamp-1 group-hover:text-amber-500 transition-colors"
						>
							{match.title}
						</h3>

						<div class="flex items-center justify-between">
							<div class="flex -space-x-2">
								{#if match.teams?.home?.badge}
									<img
										src="https://streamed.pk{match.teams.home.badge}"
										alt=""
										class="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 shadow-md"
									/>
								{/if}
								{#if match.teams?.away?.badge}
									<img
										src="https://streamed.pk{match.teams.away.badge}"
										alt=""
										class="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 shadow-md"
									/>
								{/if}
							</div>

							<div
								class="flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-white transition-colors"
							>
								Watch Stream <ChevronRight class="w-4 h-4" />
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
