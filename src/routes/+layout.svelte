<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';
	import { Toaster } from 'svelte-sonner';

	let { children, data, gravitarUrl } = $props();
</script>

<Navbar user={data.user} gravitarUrl={data.gravitarUrl} />
<Toaster richColors />
{@render children()}
