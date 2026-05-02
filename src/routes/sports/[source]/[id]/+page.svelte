<script>
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { getStreams, getMatches } from "$lib/remote/sports.remote";
	import { Play, Share2, Info, ChevronLeft, Layout, Monitor, Users } from "lucide-svelte";
	import { goto } from "$app/navigation";

	let { source, id } = $page.params;
	let streams = $state([]);
	let matchInfo = $state(null);
	let selectedStream = $state(null);
	let loading = $state(true);
	let isPlayerLoading = $state(true);
	onMount(async () => {
		const streamsTask = getStreams({ source, id });

		const matchesTask = getMatches("all");

		const [streamsRes, allMatches] = await Promise.all([streamsTask, matchesTask]);

		streams = streamsRes;
		if (streams.length > 0) {
			selectedStream = streams[0];
		}

		matchInfo = allMatches.find((m) => m.sources.some((s) => s.source === source && s.id === id));

		loading = false;
	});

	function handleStreamChange(stream) {
		selectedStream = stream;
		isPlayerLoading = true;
	}

	function handleIframeLoad() {
		isPlayerLoading = false;
	}

	function changeSource(newSource, newId) {
		goto(`/sports/${newSource}/${newId}`);
	}
</script>

<div class="flex flex-col min-h-screen bg-black text-white">
	<!-- Player Header -->
	<div
		class="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-20"
	>
		<div class="flex items-center gap-4">
			<a
				href="/sports"
				class="p-2 border border-gray-700 rounded-xl hover:bg-gray-800 transition shadow-lg"
			>
				<ChevronLeft class="w-5 h-5" />
			</a>
			<div>
				<h1 class="text-lg md:text-xl font-bold tracking-tight line-clamp-1">
					{matchInfo ? matchInfo.title : "Live Sports Stream"}
				</h1>
				<div
					class="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-amber-500"
				>
					<span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
					{source} Source • {selectedStream ? selectedStream.language : "Streaming"}
				</div>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button class="p-2 text-gray-400 hover:text-white transition">
				<Share2 class="w-5 h-5" />
			</button>
		</div>
	</div>

	<div class="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-8">
		<!-- Main Player Area -->
		<div class="flex-1 flex flex-col">
			<div
				class="relative aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden bg-gray-900 shadow-2xl border border-white/5 ring-1 ring-white/10"
			>
				{#if loading}
					<div
						class="absolute inset-0 flex items-center justify-center bg-gray-950/90 backdrop-blur-md"
					>
						<div class="flex flex-col items-center gap-4">
							<div
								class="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"
							></div>
							<p class="text-amber-500 font-bold tracking-widest uppercase text-xs">
								Finding Streams...
							</p>
						</div>
					</div>
				{:else if selectedStream}
					{#if isPlayerLoading}
						<div
							class="absolute inset-0 flex items-center justify-center bg-gray-950/90 backdrop-blur-md z-10 transition-opacity"
						>
							<div class="flex flex-col items-center gap-4 text-center">
								<Play class="w-12 h-12 text-amber-500 animate-pulse" fill="currentColor" />
								<div>
									<p class="text-white font-black text-lg tracking-widest uppercase">Connecting</p>
									<p class="text-gray-500 text-xs mt-1">Ready to start the action</p>
								</div>
							</div>
						</div>
					{/if}

					<iframe
						src={selectedStream.embedUrl}
						class="absolute inset-0 w-full h-full"
						allowfullscreen
						loading="lazy"
						title="Sports Player"
						onload={handleIframeLoad}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerpolicy="no-referrer"
					></iframe>
				{:else}
					<div
						class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gray-950/90"
					>
						<div class="bg-red-500/10 p-6 rounded-full mb-4 border border-red-500/20">
							<Monitor class="w-12 h-12 text-red-500" />
						</div>
						<h2 class="text-2xl font-black mb-2 text-white">Stream Unavailable</h2>
						<p class="text-gray-500 max-w-sm">
							This event may have ended or is temporarily unavailable. Please try another source or
							check back later.
						</p>
						<a
							href="/sports"
							class="mt-8 px-8 py-3 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition"
							>Go Back</a
						>
					</div>
				{/if}
			</div>

			<!-- Teams & Title Row (Desktop) -->
			{#if matchInfo && matchInfo.teams}
				<div
					class="hidden md:flex items-center justify-center gap-12 mt-8 p-6 bg-gray-900/30 rounded-3xl border border-gray-800/50"
				>
					<div class="flex flex-col items-center gap-3">
						{#if matchInfo.teams.home?.badge}
							<img
								src="https://streamed.pk{matchInfo.teams.home.badge}"
								alt=""
								class="w-16 h-16 object-contain filter drop-shadow-lg"
							/>
						{/if}
						<span class="font-bold text-center">{matchInfo.teams.home?.name || "Home Team"}</span>
					</div>

					<div class="text-4xl font-black text-gray-700">VS</div>

					<div class="flex flex-col items-center gap-3">
						{#if matchInfo.teams.away?.badge}
							<img
								src="https://streamed.pk{matchInfo.teams.away.badge}"
								alt=""
								class="w-16 h-16 object-contain filter drop-shadow-lg"
							/>
						{/if}
						<span class="font-bold text-center">{matchInfo.teams.away?.name || "Away Team"}</span>
					</div>
				</div>
			{/if}

			<!-- Stream Info Cards -->
			<div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-3xl">
					<div class="flex items-center gap-3 mb-2 text-gray-400">
						<Layout class="w-4 h-4" />
						<span class="text-xs font-black uppercase tracking-widest">Quality Options</span>
					</div>
					<h3 class="text-xl font-bold mb-4">Choose Stream</h3>
					<div class="flex flex-wrap gap-2">
						{#each streams as stream}
							<button
								onclick={() => handleStreamChange(stream)}
								class="px-4 py-2 rounded-xl text-sm font-bold transition-all {selectedStream?.id ===
								stream.id
									? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
									: 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
							>
								{stream.language}
								{stream.hd ? "HD" : "SD"}
							</button>
						{/each}
					</div>
				</div>

				<div class="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-3xl">
					<div class="flex items-center gap-3 mb-2 text-gray-400">
						<Info class="w-4 h-4" />
						<span class="text-xs font-black uppercase tracking-widest">About Match</span>
					</div>
					<h3 class="text-xl font-bold mb-2">Details</h3>
					{#if matchInfo}
						<p class="text-sm text-gray-400 mb-1">
							Sport: <span class="text-white capitalize">{matchInfo.category}</span>
						</p>
						<p class="text-sm text-gray-400">
							Started: <span class="text-white">{new Date(matchInfo.date).toLocaleString()}</span>
						</p>
					{:else}
						<p class="text-sm text-gray-500 leading-relaxed">
							Streaming live sports from global sources. Catch the action as it happens.
						</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Sidebar for Alternative Sources -->
		<div class="flex flex-col w-full lg:w-80 flex-shrink-0 gap-6">
			{#if matchInfo && matchInfo.sources && matchInfo.sources.length > 1}
				<div class="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-3xl h-fit">
					<h3 class="text-lg font-bold mb-4 flex items-center gap-2">
						<Layout class="w-5 h-5 text-amber-500" />
						Switch Main Source
					</h3>
					<div class="space-y-2">
						{#each matchInfo.sources as src}
							<button
								onclick={() => changeSource(src.source, src.id)}
								class="w-full text-left p-4 rounded-2xl border transition-all {src.source ===
									source && src.id === id
									? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
									: 'bg-gray-800/50 border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'}"
							>
								<div class="flex justify-between items-center mb-1">
									<span class="text-[10px] font-black uppercase tracking-widest"
										>Source: {src.source}</span
									>
									{#if src.source === source && src.id === id}
										<div
											class="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"
										></div>
									{/if}
								</div>
								<p class="text-sm font-bold">
									Watch on {src.source.charAt(0).toUpperCase() + src.source.slice(1)}
								</p>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-3xl h-fit">
				<h3 class="text-lg font-bold mb-4 flex items-center gap-2">
					<Monitor class="w-5 h-5 text-amber-500" />
					Current Provider Streams
				</h3>
				<div class="grid grid-cols-1 gap-2">
					{#each streams as stream, i}
						<button
							onclick={() => handleStreamChange(stream)}
							class="w-full text-left p-3 rounded-xl border transition-all {selectedStream?.id ===
							stream.id
								? 'bg-white/10 border-white/20 text-white'
								: 'bg-transparent border-transparent text-gray-400 hover:bg-white/5'}"
						>
							<div class="flex justify-between items-center">
								<span class="text-sm font-medium">{stream.language} Stream #{i + 1}</span>
								{#if stream.hd}
									<span class="text-[9px] font-black px-1 py-0.5 rounded bg-gray-800 text-gray-400"
										>HD</span
									>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
