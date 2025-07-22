<script>
  import { onMount } from 'svelte';
  import { page } from "$app/stores";
  

  let {data}  = $props()

  let anime_data = data.anime_data

  let anime_id = $page.params.anime_id;

  let dub = $state(true);
  let episode = $state(1);
  let autoSkipIntro = $state(false);
  let selectedSource = $state(0);
  let lang = $state("dub");
  let iframeKey = $state(0); // Add this to force iframe refresh
  
  // let totalEpisodes = $state(anime_data.episodes);
  let animeTitle = $state({ romaji: '', english: '', native: '', userPreferred: '' });
  let animeDescription = $state(anime_data.description);
  let coverImage = $state(anime_data.coverImage.large);
  let genres = $state([]);
  let status = $state('');
  let format = $state('');
  let duration = $state(0);
  let averageScore = $state(0);
  let popularity = $state(0);
  let season = $state('');
  let seasonYear = $state(0);
  let trailer = $state(null);
  let relations = $state([]);
  let characters = $state([]);
  let staff = $state([]);
  let studios = $state([]);

  console.log(anime_data)

  function changeLang() {
    if (dub) {
      lang = "sub";
      dub = false;
    } else {
      lang = "dub";
      dub = true;
    }
    // Force iframe refresh by changing key
    iframeKey++;
  }

  function changeSource(index) {
    selectedSource = index;
    // Force iframe refresh when changing source
    iframeKey++;
  }

  // Also refresh iframe when episode changes
  function changeEpisode(newEpisode) {
    episode = newEpisode;
    iframeKey++;
  }

  let iframeSources = $derived([
    `https://vidsrc.cc/v2/embed/anime/ani${anime_id}/${episode}/${lang}`,
    `https://player.videasy.net/anime/${anime_id}/${episode}?dub=${dub ? true : false}`
  ]);


  let chunkSize = 50
  let totalDropdowns = Math.ceil(anime_data.episodes / chunkSize);
  let dropdownRanges = Array.from({ length: totalDropdowns }, (_, i) => {
        const start = i * chunkSize + 1;
        const end = Math.min((i + 1) * chunkSize, anime_data.episodes);
        return {
            label: `${start} - ${end}`,
            value: i + 1
        };
  })


  let dropdownIndex = $state(0)


  onMount(() => {
    
  });

</script>

<div class="min-h-screen text-white bg-black">
  <div class="max-w-7xl mx-auto px-6 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="mb-6">
          <div class="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl aspect-video border border-white">
            <iframe
              key={iframeKey}
              src={iframeSources[selectedSource]}
              class="absolute w-full h-full"
              allowfullscreen
              loading="lazy"
              title="Anime Player"
            ></iframe>
          </div>
          
          <div class="flex gap-2 mt-4">
            {#each iframeSources as source, index}
              <button
                class={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  index === selectedSource
                    ? 'bg-white text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onclick={() => changeSource(index)}
              >
                Server {index + 1}
              </button>
            {/each}
          </div>
        </div>

        <div class="mb-6">
          <span class="text-sm text-gray-400 mr-4">Audio:</span>
          <div class="inline-flex rounded-lg overflow-hidden">
            <button 
              class={`px-4 py-2 text-sm font-medium ${!dub ? 'bg-white text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onclick={() => { if (dub) changeLang(); }}
            >
              Subtitle
            </button>
            <button 
              class={`px-4 py-2 text-sm font-medium ${dub ? 'bg-white text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onclick={() => { if (!dub) changeLang(); }}
            >
              Dubbed
            </button>
          </div>
        </div>

        <div class="flex gap-6 mb-8">
          {#if anime_data.coverImage}
            <img
              src={anime_data.coverImage.large}
              alt={anime_data.userPreferred || 'Anime Cover'}
              class="w-48 h-64 object-cover rounded-lg shadow-lg"
            />
          {/if}
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-4">
              {anime_data.title.romaji}
            </h1>
            
            <div class="flex items-center gap-4 mb-4">
              <span class="text-yellow-400">★ {anime_data.averageScore ? (anime_data.averageScore/10).toFixed(1) : 'N/A'}</span>
              <span class="text-gray-400">📅 {anime_data.season} {anime_data.seasonYear}</span>
              <span class="text-gray-400">🎬 {anime_data.format}</span>
              <span class="text-gray-400">⏱️ {anime_data.duration || 24} min</span>
            </div>

            <div class="mb-4">
              {#if anime_data.animeDescription}
                <div class="text-gray-300 text-sm leading-relaxed" innerHTML={anime_data.description.replace(/<br\s*\/?>/gi, ' ').substring(0, 300) + '...'}></div>
              {/if}
            </div>

            <div class="flex flex-wrap gap-2">
              {#each genres.slice(0, 3) as genre}
                <span class="px-3 py-1 bg-white text-black text-sm rounded-full">
                  {genre}
                </span>
              {/each}
            </div>
          </div>
        </div>

        {#if relations.length > 0}
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4 text-white">Recommended</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each relations.slice(0, 4) as relation}
                <a href={`/anime/${relation.id}`} class="group">
                  <div class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
                    {#if relation.coverImage}
                      <img
                        src={relation.coverImage.medium}
                        alt={relation.title.userPreferred}
                        class="w-full h-32 object-cover"
                      />
                    {/if}
                    <div class="p-3">
                      <p class="text-sm font-medium line-clamp-2">
                        {relation.title.userPreferred || relation.title.english || relation.title.romaji}
                      </p>
                    </div>
                  </div>
                </a>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="lg:col-span-1">
        <div class="bg-gray-800 rounded-lg p-6 sticky top-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Episodes</h2>
            <span class="text-sm text-gray-400">{anime_data.episodes} episodes</span>
          </div>
          
          <div class="mb-4">
            <select class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white">
              {#each dropdownRanges as dropdown}
              <option>1-{`${51}`}</option>
              {/each}
            </select>
          </div>

          <div class="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
            {#each Array(Math.min(anime_data.episodes, 51)) as _, i}
              <button
                class={`aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
                  episode === i + 1
                    ? 'bg-white text-black'
                    : i === 0
                    ? 'bg-white-600 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onclick={() => changeEpisode(i + 1)}
              >
                {i + 1}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>

    {#if anime_data.characters.length > 0}
      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6 text-cyan-400">Characters</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {#each characters.slice(0, 12) as charEdge}
            <div class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
              {#if charEdge.node.image}
                <img
                  src={charEdge.node.image.large}
                  alt={charEdge.node.name.full}
                  class="w-full h-32 object-cover"
                />
              {/if}
              <div class="p-3">
                <p class="text-sm font-medium line-clamp-2">{charEdge.node.name.full}</p>
                <p class="text-xs text-gray-400 mt-1">{charEdge.role}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
      


    {#if staff.length > 0}
      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6 text-cyan-400">Staff</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {#each staff.edges.slice(0, 12) as staffEdge}
            <div class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
              {#if staffEdge.node.image}
                <img
                  src={staffEdge.node.image.large}
                  alt={staffEdge.node.name.full}
                  class="w-full h-32 object-cover"
                />
              {/if}
              <div class="p-3">
                <p class="text-sm font-medium line-clamp-2">{staffEdge.node.name.full}</p>
                <p class="text-xs text-gray-400 mt-1">{staffEdge.role}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>