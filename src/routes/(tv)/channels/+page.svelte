<script>
	let { data } = $props();
	let channels = data.channels;
	let searchQuery = $state('');

	let filteredChannels = $derived(
		channels.filter((channel) => channel.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<div class="mx-auto max-w-7xl p-6 text-white">
	<div class="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-4">
				<h1
					class="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-5xl font-black text-transparent"
				>
					Live Channels
				</h1>
				<a
					href="/channels/schedules"
					class="flex items-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-pink-500 transition-all hover:bg-pink-500 hover:text-white hover:shadow-[0_0_20px_rgba(219,39,119,0.3)]"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-calendar"
						><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path
							d="M3 10h18"
						/></svg
					>
					Live Schedule
				</a>
			</div>
			<p class="text-sm font-medium text-gray-500">Explore and watch your favorite live TV channels</p>
		</div>

		<div class="relative w-full md:w-80">
			<label for="search" class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500"
				>Search Channels</label
			>
			<input
				id="search"
				type="text"
				bind:value={searchQuery}
				placeholder="Search by name..."
				class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-gray-500 transition-all focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
			/>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each filteredChannels as channel}
			<a
				href="/channels/{channel.channelId}"
				class="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 transition-all duration-300 hover:border-pink-500/30 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(219,39,119,0.1)]"
			>
				<div class="flex flex-col gap-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-600/10 text-pink-500 ring-1 ring-pink-500/20 transition-all group-hover:bg-pink-600 group-hover:text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-tv"
							><rect width="20" height="15" x="2" y="7" rx="2" ry="2" /><path d="m17 2-5 5-5-5" /></svg
						>
					</div>

					<div class="flex flex-col">
						<h3
							class="line-clamp-2 text-lg font-black leading-tight text-white transition-colors group-hover:text-pink-400"
						>
							{channel.title}
						</h3>
						<span
							class="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400"
						>
							ID: {channel.channelId}
						</span>
					</div>

					<div class="mt-2 flex items-center gap-2 text-xs font-bold text-pink-500/80">
						<span class="flex h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"
						></span>
						LIVE NOW
					</div>
				</div>

				<!-- Subtle accent line on hover -->
				<div
					class="absolute bottom-0 left-0 h-0.5 w-0 bg-pink-600 transition-all duration-500 group-hover:w-full"
				></div>
			</a>
		{:else}
			<div class="col-span-full flex flex-col items-center justify-center py-32 text-gray-500">
				<div class="mb-4 rounded-full bg-white/5 p-6 ring-1 ring-white/10">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-search-x"
						><path d="m13.5 8.5-5 5" /><path d="m8.5 8.5 5 5" /><circle cx="11" cy="11" r="8" /><path
							d="m21 21-4.3-4.3"
						/></svg
					>
				</div>
				<p class="text-2xl font-bold text-gray-400">No channels found</p>
				<p class="mt-1">Try searching for a different channel name.</p>
			</div>
		{/each}
	</div>
</div>