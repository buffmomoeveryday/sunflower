<script>
	import { page } from '$app/stores';
	let { data, form } = $props();
	let buttonDisabled = $state('true');
	let email = $state('');
	let password = $state('');

	$effect(() => {
		if (email == '' || password == '') {
			buttonDisabled = true;
		} else {
			buttonDisabled = false;
		}
	});
</script>

<div class="min-h-[100vh] bg-black">
	<div class="flex flex-col justify-center h-full p-6 text-white">
		{#if form?.fail}
			<div class="px-4 py-2 mb-4 text-red-400 bg-red-900 rounded-lg bg-opacity-20">
				{form.message}
			</div>
		{/if}

		<form action="?/login" method="post">
			<h1 class="pb-5 text-xl font-bold">Login</h1>
			<label class="block mb-4">
				<span class="block text-sm font-medium text-gray-300">E-Mail</span>
				<input
					class="w-full px-3 py-2 mt-1 text-gray-100 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					name="email"
					title="E-Mail"
					type="email"
					placeholder="mail@example.com"
					bind:value={email}
				/>
			</label>
			<label class="block mb-4">
				<span class="block text-sm font-medium text-gray-300">Password</span>
				<input
					class="w-full px-3 py-2 mt-1 text-gray-100 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					name="password"
					title="Password"
					type="password"
					bind:value={password}
					placeholder="Your password"
				/>
			</label>

			<button
				class="w-full px-4 py-2 font-semibold text-black bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 disabled:bg-gray-500"
				type="submit"
				disabled={buttonDisabled}
			>
				Login
			</button>
		</form>
		<span>
			Don't Have an Account <a href="/register">Register</a>
		</span>
	</div>
</div>
