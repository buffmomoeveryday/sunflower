<script>
	import { LogOut } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	import { enhance } from '$app/forms';

	const props = $props();

	const navItems = $state([
		{ name: 'Home', path: '/' },
		{ name: 'Series', path: '/watch/series' },
		{ name: 'Bollyhood', path: '/watch/bollyhood' },
		{ name: 'Search', path: '/watch/search' }
	]);

	function isActive(path) {
		return $page.url.pathname.startsWith(path);
	}

	const user = props.user;
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
		<li>
			{#if user}
				<form method="POST" action="/logout" class="flex gap-2 flex-cols">
					<div class="text-white">
						{user.email}
					</div>
					<button class="p-3 text-white bg-red-600 rounded">Log out</button>
				</form>
			{:else}
				<a href="/login" class="p-3 text-white bg-green-600 rounded">Login</a>
			{/if}
		</li>
	</ul>
</nav>
<ProgressBar class="text-green-500" />
