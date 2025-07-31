<script>
	import { page } from '$app/stores';
	import { BaseAuthStore } from 'pocketbase';
	import { onMount } from 'svelte';
	let { data, form } = $props();
	
	function validateEmail(email) {
	const valid = String(email)
		.toLowerCase()
		.match(
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);

	return !!valid;
	}


	let email = $state('');
	let validEmail = $derived.by(()=>{
		validateEmail(email)
	});
	let password = $state('');
	let loggingIn = $state(false);
	
	let buttonDisabled = $state(true); 


	onMount(()=>{

	})

	$effect(() => {
		buttonDisabled = email === '' || password === '';
	});


</script>

<div class="min-h-screen bg-black flex items-center justify-center p-4">
	<div class="bg-black rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
		{#if form?.fail}
			<div
				class="px-5 py-3 mb-6 text-red-300 bg-red-900 rounded-lg bg-opacity-30 text-center font-medium"
			>
				{form.message}
			</div>
		{/if}

		<form action="?/login" method="post" class="space-y-6">
			<label class="block">
				<span class="block text-sm font-semibold text-gray-300 mb-2">Email Address</span>
				<input
					class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition duration-200 ease-in-out"
					name="email"
					title="E-Mail"
					type="email"
					placeholder="mail@example.com"
					bind:value={email}
				/>
			</label>

			<label class="block">
				<span class="block text-sm font-semibold text-gray-300 mb-2">Password</span>
				<input
					class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white-500 transition duration-200 ease-in-out"
					name="password"
					title="Password"
					type="password"
					bind:value={password}
					placeholder="Your secret password"
				/>
			</label>

			<button
			onclick={()=>{
				loggingIn = !loggingIn
			}}
				class="w-full px-6 py-3 mt-4 bg-white font-bold text-black rounded-lg shadow-lg focus:outline-none focus:ring-3 focus:ring-white focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out"
				type="submit"
				disabled={buttonDisabled}
			>
			{#if loggingIn}
				Logging In ....
			{:else}
				Login
			{/if}

		</button>
		</form>

		<div class="mt-8 text-center text-gray-400 text-sm">
			Don't have an account?
			<a
				href="/register"
				class="text-white hover:text-blue font-medium transition duration-200 ease-in-out"
			>
				Register here
			</a>
		</div>
	</div>
</div>
