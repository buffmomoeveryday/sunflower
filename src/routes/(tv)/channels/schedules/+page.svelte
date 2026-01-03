<script>
	let { data } = $props();
	let schedules = data.schedules;
	let searchQuery = $state('');
	let selectedOffset = $state(0); // Default to UK (+0)
	let showUpcoming = $state(true);

	const offsets = [
		{ label: 'UK (GMT/BST)', value: 0 },
		{ label: 'Eastern (EST)', value: -5 },
		{ label: 'Pacific (PST)', value: -8 },
		{ label: 'India (IST)', value: 5.5 },
		{ label: 'Nepal (NPT)', value: 5.75 }
	];

	function getEventDateTime(sourceTime, offsetHours) {
		if (!sourceTime) return { time: 'N/A', date: '', day: '' };
		const [hours, minutes] = sourceTime.split(':').map(Number);
		const date = new Date();
		date.setUTCHours(hours, minutes, 0, 0);

		// Add offset (Site is UK/GMT, so we add the offset to UTC)
		date.setMinutes(date.getMinutes() + offsetHours * 60);

		return {
			time: date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: 'numeric',
				hour12: true
			}),
			date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
			day: date.toLocaleDateString('en-US', { weekday: 'short' }),
			raw: date
		};
	}

	function isPassed(sourceTime) {
		if (!sourceTime) return false;
		const { raw } = getEventDateTime(sourceTime, 0); // Check against UK time
		const now = new Date();
		return now > raw;
	}

	let filteredSchedules = $derived(
		schedules
			.map((cat) => {
				let events = cat.events.filter(
					(event) =>
						event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						cat.category.toLowerCase().includes(searchQuery.toLowerCase())
				);

				// Sort: Passed first, then by time
				events.sort((a, b) => {
					const aPassed = isPassed(a.time);
					const bPassed = isPassed(b.time);
					if (aPassed !== bPassed) return aPassed ? -1 : 1;
					return (a.time || '').localeCompare(b.time || '');
				});

				// Toggle upcoming
				if (!showUpcoming) {
					events = events.filter((e) => isPassed(e.time));
				}

				return { ...cat, events };
			})
			.filter((cat) => cat.events.length > 0)
	);
</script>

<div class="mx-auto max-w-6xl p-6 text-white">
	<div class="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
		<div class="flex flex-col gap-2">
			<h1
				class="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-5xl font-black text-transparent"
			>
				Live Schedule
			</h1>
			<p class="text-sm font-medium text-gray-500">Stay updated with live sports and TV events</p>
		</div>

		<div class="flex flex-wrap items-end gap-4">
			<button
				onclick={() => (showUpcoming = !showUpcoming)}
				class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-black uppercase tracking-widest transition-all hover:bg-pink-600/20 active:scale-95 {showUpcoming
					? 'text-pink-500 ring-2 ring-pink-500/20'
					: 'text-gray-500 opacity-50'}"
			>
				{showUpcoming ? 'Showing All' : 'Passed Only'}
			</button>

			<div class="flex flex-col gap-1.5">
				<label for="timezone" class="text-xs font-bold uppercase tracking-wider text-gray-500"
					>Timezone</label
				>
				<select
					id="timezone"
					bind:value={selectedOffset}
					class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold transition-all focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
				>
					{#each offsets as offset}
						<option value={offset.value} class="bg-gray-900">{offset.label}</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="search" class="text-xs font-bold uppercase tracking-wider text-gray-500"
					>Search</label
				>
				<input
					id="search"
					type="text"
					bind:value={searchQuery}
					placeholder="Search events..."
					class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm placeholder:text-gray-500 transition-all focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 md:w-48"
				/>
			</div>
		</div>
	</div>

	{#each filteredSchedules as cat}
		<section class="mb-12">
			<h2
				class="mb-6 flex items-center gap-3 text-2xl font-black tracking-tight text-white/90"
			>
				<span class="h-8 w-1.5 rounded-full bg-pink-600 shadow-[0_0_15px_rgba(219,39,119,0.5)]"></span
				>
				{cat.category}
			</h2>

			<div class="grid gap-4">
				{#each cat.events as event}
					{@const eventTime = getEventDateTime(event.time, selectedOffset)}
					<div
						class="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition-all duration-300 hover:border-pink-500/30 hover:bg-white/[0.08] {isPassed(
							event.time
						)
							? 'opacity-40 grayscale-[0.8]'
							: ''}"
					>
						<div class="flex flex-col gap-5 sm:flex-row sm:items-center">
							<div class="flex items-center gap-4">
								<div class="flex flex-col items-center">
									<span
										class="w-fit rounded-xl bg-pink-600/10 px-4 py-2 font-mono text-lg font-black text-pink-500 ring-1 ring-pink-500/20"
									>
										{eventTime.time}
									</span>
									{#if isPassed(event.time)}
										<span class="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-500"
											>Passed</span
										>
									{/if}
								</div>

								<div class="flex flex-col uppercase tracking-tighter">
									<span class="text-xs font-black text-white/40">{eventTime.day}</span>
									<span class="text-sm font-black text-pink-500/60">{eventTime.date}</span>
								</div>
							</div>

							<div class="flex-1">
								<h3
									class="text-xl font-bold leading-tight text-white transition-colors group-hover:text-pink-400"
								>
									{event.title}
								</h3>

								<div class="mt-4 flex flex-wrap gap-2">
									{#each event.channels as channel}
										<a
											href="/channels/{channel.channelId}"
											class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 transition-all hover:scale-105 hover:border-pink-500/50 hover:bg-pink-600 hover:text-white active:scale-95 shadow-lg"
										>
											{channel.name}
										</a>
									{/each}
								</div>
							</div>
						</div>
						
						<!-- Subtle accent line on hover -->
						<div class="absolute bottom-0 left-0 h-0.5 w-0 bg-pink-600 transition-all duration-500 group-hover:w-full"></div>
					</div>
				{/each}
			</div>
		</section>
	{:else}
		<div class="flex flex-col items-center justify-center py-32 text-gray-500">
			<div class="mb-4 rounded-full bg-white/5 p-6 ring-1 ring-white/10">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-x"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			</div>
			<p class="text-2xl font-bold text-gray-400">No events found</p>
			<p class="mt-1">Try adjusting your search or category filter.</p>
		</div>
	{/each}
</div>

