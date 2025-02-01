<script>
	let props = $props();
</script>

<div
	class="w-full overflow-hidden transition-all duration-300 bg-gray-900 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
>
	<a href="/watch/series/{props.id}" class="block text-white no-underline">
		<div class="relative w-full pb-[150%]">
			<img
				src="https://image.tmdb.org/t/p/w185/{props.poster_path}"
				alt={props.original_title}
				class="absolute inset-0 object-cover w-full h-full rounded-t-lg"
				loading="lazy"
			/>
		</div>
		<div class="p-3">
			<h3 class="text-sm font-medium text-center line-clamp-2 sm:text-base">
				{props.original_title}
			</h3>
		</div>
	</a>
</div>
