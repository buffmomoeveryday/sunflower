<script>
	let { data } = $props();
	let { channel } = data;
	let selectedPlayer = $state('player1');
</script>

<div class="mx-auto max-w-5xl p-6">
	<header class="mb-8 flex flex-col gap-2">
		<a
			href="/channels"
			class="flex w-fit items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-pink-500"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-chevron-left"
			>
				<path d="m15 18-6-6 6-6" />
			</svg>
			Back to Channels
		</a>
		<h1 class="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-4xl font-black text-transparent">
			{channel.title}
		</h1>
	</header>

	<div class="group relative mb-10 overflow-hidden rounded-2xl bg-black/40 shadow-2xl backdrop-blur-md ring-1 ring-white/10 transition-all duration-300 hover:ring-pink-500/50">
		<div class="aspect-video w-full overflow-hidden rounded-xl">
			{@html channel.embedLink[selectedPlayer]}
		</div>
		
		<!-- Overlay for a more premium feel if player is loading/inactive -->
		<div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
	</div>

	<div class="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
		<h2 class="mb-4 text-lg font-semibold text-gray-200">Select Server</h2>
		<div class="flex flex-wrap gap-3">
			{#each Object.keys(channel.embedLink) as player}
				<button
					onclick={() => (selectedPlayer = player)}
					class="relative overflow-hidden rounded-xl border px-6 py-3 font-bold transition-all duration-300 active:scale-95 {selectedPlayer === player
						? 'border-pink-500/50 bg-pink-600 text-white shadow-[0_0_20px_rgba(219,39,119,0.3)]'
						: 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-white'}"
				>
					<span class="relative z-10">{player.toUpperCase().replace('PLAYER', 'SERVER ')}</span>
					{#if selectedPlayer === player}
						<div class="absolute inset-0 bg-gradient-to-tr from-pink-600 to-rose-400 opacity-20"></div>
					{/if}
				</button>
			{/each}
		</div>
		
		<div class="mt-8 flex items-center gap-4 rounded-xl bg-yellow-500/10 p-4 text-sm text-yellow-500/80 ring-1 ring-yellow-500/20">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
			<p>If a server doesn't work, try switching to another. Some servers may have ads; we recommend using an ad-blocker.</p>
		</div>
	</div>
</div>

<style>
	:global(iframe) {
		display: block;
		width: 100%;
		height: 100%;
		border: none;
	}
</style>