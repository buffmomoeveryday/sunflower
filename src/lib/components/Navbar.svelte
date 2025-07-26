<script>
	import { LogOut } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	const { data, user, gravitarUrl } = $props();

	let dropdownOpen = $state(false);
	let mobileMenuOpen = $state(false);

	const navItems = $derived([
		{ name: 'Home', path: '', icon: 'home' },
		{ name: 'Movies', path: '/movie', icon: 'home' },
		{ name: 'Series', path: '/series', icon: 'tv' },
		{ name: 'Anime', path: '/anime', icon: 'search' },
		{ name: 'Dramas', path: '/dramas', icon: 'search' },
		{ name: 'Search', path: '/search', icon: 'search' }
	]);

	function isActive(path) {
		return $page.url.pathname.startsWith(path);
	}

	function handleClickOutside(event) {
		const dropdown = document.querySelector('.dropdown');
		if (dropdown && !dropdown.contains(event.target)) {
			dropdownOpen = false;
		}
	}

	// Listen for clicks on the window
	onMount(() => {
		window.addEventListener('click', handleClickOutside);
		return () => {
			window.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<nav class="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur-sm">
	<div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center space-x-4">
				<button
					class="block text-gray-300 md:hidden"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					aria-label="menu toggle"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
					</svg>
				</button>
				<span class="text-xl font-bold text-white"><a href="/"> 🌻Sunflower </a></span>
			</div>

			<div class="items-center hidden space-x-4 md:flex">
				{#each navItems as item}
					<a
						href={item.path}
						class={'px-3 py-2 rounded-lg transition ' +
							(isActive(item.path) ? 'bg-white text-black' : 'text-white hover:text-gray-300')}
						>{item.name}</a
					>
				{/each}
			</div>

			<div class="relative dropdown">
				{#if user}
					<div class="flex items-center gap-3">
						<button
							type="button"
							class="flex items-center gap-2 p-2 transition rounded-lg hover:bg-gray-800"
							onclick={() => (dropdownOpen = !dropdownOpen)}
							aria-haspopup="true"
							aria-expanded={dropdownOpen}
						>
							<img
								src={gravitarUrl}
								alt={user.email}
								class="w-8 h-8 rounded-full ring-2 ring-gray-800"
							/>
							<span class="hidden text-gray-300 md:block">{user.email}</span>
						</button>

						{#if dropdownOpen}
							<div
								class="absolute right-0 z-50 w-48 py-2 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl"
								use:fade
							>
								<form method="POST" action="/logout" use:enhance class="px-4 py-2">
									<button
										type="submit"
										class="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-400 transition rounded hover:text-red-300 hover:bg-gray-800"
										>Log out</button
									>
								</form>
							</div>
						{/if}
					</div>
				{:else}
					<a
						href="/login"
						class="px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-500"
						>Login</a
					>
				{/if}
			</div>
		</div>

		{#if mobileMenuOpen}
			<div class="flex flex-col mt-4 space-y-2 md:hidden">
				{#each navItems as item}
					<a
						href={item.path}
						class={'block px-4 py-2 rounded-lg transition ' +
							(isActive(item.path) ? 'bg-white text-black' : 'text-white hover:text-gray-300')}
						>{item.name}</a
					>
				{/each}
			</div>
		{/if}
	</div>
</nav>
<ProgressBar color="#ffb901" zIndex={100} />
