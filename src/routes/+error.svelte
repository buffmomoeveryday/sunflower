<script>
	import { emojis } from "$lib/emoji";
</script>

<div class="flex flex-col items-center justify-center min-h-screen text-center p-6">
	<h1 class="text-6xl font-bold mb-4">404 - Page Not Found</h1>
	<span class="text-[10rem]">
		{emojis[404] ?? emojis[500]}
	</span>
	<p class="mt-6 text-lg text-gray-600">Sorry, the page you’re looking for doesn’t exist.</p>
	<a href="/" class="mt-6 text-blue-500 hover:underline">Go back home</a>
</div>
