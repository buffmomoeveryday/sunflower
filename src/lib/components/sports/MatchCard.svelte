<script>
	let { match } = $props();
	function formatUnixTimestamp(timestamp) {
		const isSeconds = timestamp.toString().length === 10;
		const date = new Date(isSeconds ? timestamp * 1000 : timestamp);
		return date.toLocaleString();
	}
</script>

<div
	class="group relative overflow-hidden bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 border border-gray-800/50"
>
	<a href="/sports/streams/{match.id}" class="block text-white no-underline">
		<!-- Match poster placeholder or fallback icon -->
		<div class="relative w-full aspect-[2/3] overflow-hidden">
			<div
				class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 group-hover:from-blue-700 group-hover:to-purple-800 transition-colors duration-300"
			>
				<svg class="w-12 h-12 text-white/80" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
					/>
				</svg>
			</div>

			<!-- Live badge -->
			<div class="absolute top-3 left-3 z-10">
				<span class="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">LIVE</span>
			</div>

			<!-- Play button overlay (appears on hover) -->
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

		<!-- Content section -->
		<div class="p-4 space-y-2">
			<h3
				class="text-white font-semibold text-base leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors duration-300"
			>
				{match.title}
			</h3>

			<div class="flex items-center justify-between text-sm text-gray-400">
				<span class="flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{formatUnixTimestamp(match.date)}
				</span>
				<span class="capitalize">{match.category}</span>
			</div>
		</div>
	</a>
</div>
