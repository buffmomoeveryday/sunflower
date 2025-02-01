<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';
	import { Toaster } from 'svelte-sonner';

	let { children } = $props();
</script>

<Navbar />
<Toaster richColors />
{@render children()}
