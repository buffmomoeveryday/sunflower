<script>
	let { data } = $props();
	let user = data.user;
</script>

<div class="bg-black min-h-[100vh] text-white">
	Email: <p>{user.email}</p>
</div>
