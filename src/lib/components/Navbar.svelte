<script>
	import { page } from '$app/stores';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';

	const navItems = $state([
		{ name: 'Home', path: '/' },
		{ name: 'Series', path: '/watch/series' },
		// { name: 'Anime', path: '/watch/anime' },
		{ name: 'Bollyhood', path: '/watch/bollyhood' },
		{ name: 'Search', path: '/watch/search' }
	]);

	function isActive(path) {
		return $page.url.pathname.startsWith(path);
	}
</script>

<nav class="p-4 bg-black">
	<ul class="flex flex-wrap justify-center gap-4 md:flex-row md:space-x-6">
		{#each navItems as item}
			<li>
				<a
					href={item.path}
					class={'px-3 py-2 rounded-lg transition ' +
						(isActive(item.path) ? 'bg-white text-black' : 'text-white hover:text-gray-300')}
				>
					{item.name}
				</a>
			</li>
		{/each}
	</ul>
</nav>
<ProgressBar class="text-green-500" />
