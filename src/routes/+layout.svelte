<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	let { children,data } = $props();
</script>

<Navbar user = {data.user} />
<Toaster richColors />
{@render children()}
