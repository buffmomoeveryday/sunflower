<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import MD5 from 'crypto-js/md5';
	let { children, data } = $props();
	let gravitarUrl = $state(null);

	function generateAvatarUrl(emailAddress, options = {}) {
		const defaultImage = options.defaultImage || 'identicon';
		const emailHash = MD5(emailAddress.toString().trim().toLowerCase()).toString();
		return `https://www.gravatar.com/avatar/${emailHash}?d=${defaultImage}`;
	}

	if (data.user) {
		gravitarUrl = generateAvatarUrl(data.user.email);
	}
</script>

<Navbar user={data.user} {gravitarUrl} />
<Toaster richColors />
{@render children()}
