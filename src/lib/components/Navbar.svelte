<script>
	import { LogOut, Menu, Search } from "lucide-svelte";
	import { page } from "$app/stores";
	import { ProgressBar } from "@prgm/sveltekit-progress-bar";
	import { enhance } from "$app/forms";
	import { onMount } from "svelte";
	import { slide, fade } from "svelte/transition";
	import { authClient } from "$lib/auth/auth-client";

	const { data, user, gravitarUrl } = $props();

	let dropdownOpen = $state(false);
	let mobileMenuOpen = $state(false);

	let usr = $derived(user);

	const navItems = $derived([
		{ name: "Home", path: "/", icon: "home" },
		{ name: "Movies", path: "/movie", icon: "home" },
		{ name: "Series", path: "/series", icon: "tv" },
		{ name: "Anime", path: "/anime", icon: "search" },
		{ name: "Dramas", path: "/dramas", icon: "search" },
		{ name: "Channels", path: "/channels", icon: "search" },
		{ name: "Bookmarks", path: "/bookmarks", icon: "bookmarks" },
		{ name: "Watch History", path: "/watch-history", icon: "watch history" },
		{ name: "Search", path: "/search", icon: "search" }
	]);

	function isActive(path) {
		if (path === "/") {
			return $page.url.pathname === "/";
		}
		return $page.url.pathname.startsWith(path);
	}

	// Close dropdown when clicking outside
	function handleWindowClick(event) {
		const dropdown = event.target.closest(".dropdown");
		if (!dropdown) {
			dropdownOpen = false;
		}
	}

	function toggleDropdown(event) {
		event.stopPropagation();
		dropdownOpen = !dropdownOpen;
	}

	function toggleMobileMenu(event) {
		event.stopPropagation();
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:window on:click={handleWindowClick} />

<nav class="sticky top-0 z-50 w-full border-b border-gray-800 bg-black backdrop-blur-sm">
	<div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center space-x-4">
				<Menu
					class="block text-gray-300 md:hidden cursor-pointer"
					on:click={toggleMobileMenu}
					aria-label="menu toggle"
				/>
				<span class="text-xl font-bold text-white">
					<a href="/"> 🌻Sunflower </a>
				</span>
			</div>

			<div class="items-center hidden space-x-4 md:flex">
				{#each navItems as item}
					<a
						href={item.path}
						class={"px-3 py-2 rounded-lg transition " +
							(isActive(item.path) ? "bg-white text-black" : "text-white hover:text-gray-300")}
					>
						{item.name}
					</a>
				{/each}
			</div>

			<div class="relative dropdown">
				{#if usr}
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
										onclick={async () => {
											await authClient.signOut();
											usr = null;
											// location.reload();
										}}
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
			<div class="flex flex-col mt-4 space-y-2 md:hidden" transition:slide={{ duration: 300 }}>
				{#each navItems as item}
					<a
						href={item.path}
						onclick={closeMobileMenu}
						class={"block px-4 py-2 rounded-lg transition-all duration-300 ease-in-out " +
							(isActive(item.path)
								? "bg-white text-black transform scale-105"
								: "text-white hover:text-gray-300 hover:bg-gray-800")}
					>
						{item.name}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</nav>

<ProgressBar color="#ffb901" zIndex={100} />
