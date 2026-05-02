<script>
	import { LogOut, Menu, Search, Home, Tv, Bookmark, History, Trophy } from "lucide-svelte";
	import { page } from "$app/stores";
	import { ProgressBar } from "@prgm/sveltekit-progress-bar";
	import { fade, slide } from "svelte/transition";
	import { authClient } from "$lib/auth/auth-client";

	// Destructure props - Svelte 5 style
	let { data, user, gravitarUrl } = $props();

	// State runes
	let dropdownOpen = $state(false);
	let mobileMenuOpen = $state(false);

	// Derived state
	const navItems = $derived([
		{ name: "Home", path: "/", icon: Home },
		{ name: "Movies", path: "/movie", icon: Home },
		{ name: "Series", path: "/series", icon: Tv },
		{ name: "Anime", path: "/anime", icon: Search },
		{ name: "Sports", path: "/sports", icon: Trophy },
		{ name: "Dramas", path: "/dramas", icon: Search },
		{ name: "Channels", path: "/channels", icon: Search },
		...(user
			? [
					{ name: "Watch History", path: "/watch-history", icon: History }
				]
			: []),
		{ name: "Search", path: "/search", icon: Search }
	]);

	function isActive(path) {
		if (path === "/") {
			return $page.url.pathname === "/";
		}
		return $page.url.pathname.startsWith(path);
	}

	// Helper functions
	function handleWindowClick(event) {
		if (dropdownOpen && !event.target.closest(".dropdown-container")) {
			dropdownOpen = false;
		}
	}

	function toggleMobileMenu(event) {
		event.stopPropagation();
		mobileMenuOpen = !mobileMenuOpen;
	}

	function toggleDropdown(event) {
		event.stopPropagation();
		dropdownOpen = !dropdownOpen;
	}

	async function handleSignOut() {
		await authClient.signOut();
		// In Svelte 5, we don't manually reassign derived usr.
		// We let the authClient/navigation refresh the state.
		window.location.reload();
	}
</script>

<svelte:window onclick={handleWindowClick} />

<nav class="sticky top-0 z-50 w-full border-b border-gray-800 bg-black backdrop-blur-sm">
	<div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center space-x-4">
				<button
					type="button"
					onclick={toggleMobileMenu}
					class="block p-2 text-gray-300 md:hidden hover:bg-gray-900 rounded-md"
					aria-label="Toggle Menu"
				>
					<Menu size={24} />
				</button>

				<span class="text-xl font-bold text-white">
					<a href="/"> 🌻Sunflower </a>
				</span>
			</div>

			<div class="items-center hidden space-x-4 md:flex">
				{#each navItems as item}
					<a
						href={item.path}
						class={"px-3 py-2 rounded-lg transition-all duration-300 font-medium " +
							(isActive(item.path) 
								? "bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
								: "text-gray-400 hover:text-white hover:bg-gray-800")}
					>
						{item.name}
					</a>
				{/each}
			</div>

			<div class="relative dropdown-container">
				{#if user}
					<div class="flex items-center gap-3">
						<button
							type="button"
							class="flex items-center gap-2 p-2 transition rounded-lg hover:bg-gray-800"
							onclick={toggleDropdown}
							aria-haspopup="true"
							aria-expanded={dropdownOpen}
						>
							<img
								src={gravitarUrl}
								alt={user.name}
								class="w-8 h-8 rounded-full ring-2 ring-gray-800"
							/>
							<span class="hidden text-gray-300 md:block">{user.name}</span>
						</button>

						{#if dropdownOpen}
							<div
								class="absolute right-0 z-50 w-48 py-2 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl"
								transition:fade={{ duration: 200 }}
							>
								<div class="px-4 py-2">
									<button
										class="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-400 transition rounded hover:text-red-300 hover:bg-gray-800"
										onclick={handleSignOut}
									>
										<LogOut size={16} />
										Log out
									</button>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<a
						href="/login"
						class="px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-500"
					>
						Login
					</a>
				{/if}
			</div>
		</div>

		{#if mobileMenuOpen}
			<div class="flex flex-col pb-4 space-y-2 md:hidden" transition:slide={{ duration: 300 }}>
				{#each navItems as item}
					<a
						href={item.path}
						onclick={() => (mobileMenuOpen = false)}
						class={"block px-4 py-2 rounded-lg transition-all duration-300 font-medium " +
							(isActive(item.path)
								? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
								: "text-gray-400 hover:text-white hover:bg-gray-800")}
					>
						{item.name}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</nav>

<ProgressBar color="#ffb901" zIndex={100} />
