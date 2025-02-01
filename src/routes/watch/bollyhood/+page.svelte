<script>
	import BollyhoodCard from '$lib/components/BollyhoodCard.svelte';
	let { data } = $props();
	let bolyhoodData = data.bolyhoodData;
</script>

<div class="min-h-screen p-4 text-white bg-black">
	<section class="container p-4 mx-auto mt-6 rounded-lg">
		{#if bolyhoodData}
			<h2 class="text-xl font-bold md:text-2xl">Popular Bollyhood Movies</h2>
			<div
				class="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
			>
				{#each bolyhoodData.results as movie}
					<BollyhoodCard {...movie} />
				{/each}
			</div>
		{/if}
	</section>
</div>
