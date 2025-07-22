<script>
	let { id, poster_path, title, vote_average } = $props();
	let rating = Number(vote_average).toFixed(1);
</script>

<div
	class="w-full overflow-hidden transition-all duration-300 bg-gray-900 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
>
	<a href="/watch/movie/{id}" class="block text-white no-underline">
		<div class="relative w-full pb-[150%]">
			<img
				src="https://image.tmdb.org/t/p/w500/{poster_path}"
				alt={title}
				class="absolute inset-0 object-cover w-full h-full rounded-t-lg"
				loading="lazy"
			/>
		</div>
		<div class="p-3">
			<h3 class="text-base font-medium text-center line-clamp-2 sm:text-lg">
				{title}
			</h3>
			<!-- Additional movie info in footer -->
			<div class="flex items-center justify-center mt-2 text-sm text-gray-400">
				<div class="flex items-center gap-2">
					<span class="flex items-center gap-1">
						{rating}
						<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
							/>
						</svg>
					</span>
				</div>
			</div>
		</div>
	</a>
</div>
