<script>
	let props = $props();
	let shared = $state(null);
</script>

<div
	class="w-full transition-all duration-300 shadow-md max-w-[150px] sm:max-w-none sm:w-48 md:w-56 lg:w-64 group rounded-xl hover:shadow-xl hover:-translate-y-1"
>
	<a
		href="/watch/series/{props.id}"
		class="block w-full p-2 text-center text-white transition duration-200 rounded-lg"
	>
		<div class="relative h-40 sm:h-64 md:h-72 lg:h-80">
			<img
				src="https://image.tmdb.org/t/p/w185/{props.poster_path}"
				alt={props.original_title}
				class="absolute inset-0 object-cover w-full h-full rounded-t-xl"
				loading="lazy"
			/>
		</div>

		<div class="flex items-center justify-center p-2 h-14 sm:h-16">
			<p class="text-xs sm:text-sm md:text-base line-clamp-2">
				{props.original_title}
			</p>
		</div>
	</a>
</div>
