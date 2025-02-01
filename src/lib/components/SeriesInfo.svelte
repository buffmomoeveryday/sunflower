<script>
	let {
		title,
		description,
		rating,
		genre,
		year,
	} = $props();
</script>

<div class="space-y-4">
	<h1 class="text-3xl font-bold sm:text-4xl">{title}</h1>

	<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
		<span class="rounded bg-primary/10 px-2 py-1 text-primary">{rating}</span>
		<span>{year}</span>
		<span>•</span>
		<span>{genre}</span>
	</div>

	<p class="max-w-3xl text-muted-foreground">
		{description}
	</p>
</div>
