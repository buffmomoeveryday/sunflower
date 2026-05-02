<script>
	import "../app.css";

	import Navbar from "$lib/components/Navbar.svelte";
	import { Toaster } from "svelte-sonner";
	import MD5 from "crypto-js/md5";
	import { getBgImage } from "$lib/state/bgImage.svelte";
	import { fade } from "svelte/transition";
	import { page } from "$app/stores";
	import { setCurrentUser } from "$lib/state/user.svelte";
	import { setBookmarks } from "$lib/state/bookmarks.svelte.js";
	import { setMovieGenres, setTvGenres } from "$lib/state/genres.svelte.js";
	import { onMount } from "svelte";

	let { children, data } = $props();
	let gravitarUrl = $state(null);

	function generateAvatarUrl(emailAddress, options = {}) {
		const defaultImage = options.defaultImage || "identicon";
		const emailHash = MD5(emailAddress.toString().trim().toLowerCase()).toString();
		return `https://www.gravatar.com/avatar/${emailHash}?d=${defaultImage}`;
	}

	onMount(() => {
		if (data.user) {
			setCurrentUser(data.user);
			gravitarUrl = generateAvatarUrl(data.user.email);
			if (data.bookmarks) {
				setBookmarks(data.bookmarks);
			}
		}
		if (data.genres) {
			setMovieGenres(data.genres.movieGenres);
			setTvGenres(data.genres.tvGenres);
		}
	});

	const bgImage = $derived(getBgImage());
	let activeBgImage = $state(null);

	$effect(() => {
		if (bgImage) {
			const current = bgImage;
			const img = new Image();
			img.src = current;
			img.onload = () => {
				if (bgImage === current) {
					activeBgImage = current;
				}
			};
		} else {
			activeBgImage = null;
		}
	});
</script>

<Navbar user={data.user} {gravitarUrl} />
<Toaster richColors />
{#if activeBgImage && !$page.url.pathname.includes("/channels")}
	<div class="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
		{#key activeBgImage}
			<div
				transition:fade={{ duration: 1200 }}
				class="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-1000"
				style="background-image: url({activeBgImage});"
			></div>
		{/key}
		<div class="absolute inset-0 bg-black/70"></div>
	</div>
{/if}

<div class="relative min-h-screen p-4 text-white bg-transparent z-10">
	{@render children()}
</div>

<style>
	:global(body) {
		background-color: black;
		margin: 0;
	}
</style>
