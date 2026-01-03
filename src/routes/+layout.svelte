<script>
	import "../app.css";

	import Navbar from "$lib/components/Navbar.svelte";
	import { Toaster } from "svelte-sonner";
	import MD5 from "crypto-js/md5";
	import { getBgImage } from "$lib/state/bgImage.svelte";
	import { fade } from "svelte/transition";
	import { page } from "$app/stores";
	import { setCurrentUser } from "$lib/state/user.svelte";
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
		}
	});
</script>

<Navbar user={data.user} {gravitarUrl} />
<Toaster richColors />
<!-- {#if !["/search", "/bookmarks", "/watch-history", "/series"].includes($page.url.pathname)}
	{#each [getBgImage()] as bgImage (bgImage)}
		<div
			in:fade={{ duration: 600 }}
			out:fade={{ duration: 600 }}
			class="absolute inset-0 h-screen w-screen bg-cover bg-center bg-no-repeat opacity-50 z-0"
			style="background-image: url({bgImage});"
		></div>
	{/each}
{/if} -->

<div class="min-h-screen p-4 text-white bg-black">
	{@render children()}
</div>
