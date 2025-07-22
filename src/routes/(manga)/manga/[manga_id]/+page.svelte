<script>
    import { MANGA } from '@consumet/extensions';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    // Get the manga_id from the SvelteKit page store's parameters
    $: manga_id = $page.params.manga_id;

    // Initialize the MangaDex API client
    const mangadx = new MANGA.MangaDex();

    // Function to fetch manga details
    async function getMangaDetails(id) {
        if (!id) {
            throw new Error('Manga ID is required');
        }

        try {
            const data = await mangadx.fetchMangaInfo(id);
            return data;
        } catch (error) {
            console.error("Error fetching manga details:", error);
            throw error;
        }
    }

    // Function to navigate to chapter reading page
    function readChapter(chapterId) {
        goto(`/manga/${manga_id}/${chapterId}`);
    }

    // Reactive statement to fetch manga details when manga_id changes
    $: mangaDetailsPromise = manga_id ? getMangaDetails(manga_id) : Promise.resolve(null);
</script>

<svelte:head>
    <title>Manga Details - {manga_id || 'Loading...'}</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full">
        <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Manga Details</h1>

        {#await mangaDetailsPromise}
            <div class="flex flex-col items-center justify-center py-10">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p class="text-gray-600 text-lg">Loading manga information...</p>
            </div>
        {:then manga}
            {#if manga}
                <div class="flex flex-col md:flex-row gap-8">
                    <!-- Manga Cover Image -->
                    <div class="flex-shrink-0 flex justify-center md:justify-start">
                        {#if manga.image}
                            <img 
                                src={manga.image} 
                                alt={manga.title || 'Manga Cover'} 
                                class="manga-cover"
                                loading="lazy"
                            />
                        {:else}
                            <div class="manga-cover bg-gray-200 flex items-center justify-center text-gray-500 text-center p-4">
                                No Image Available
                            </div>
                        {/if}
                    </div>

                    <!-- Manga Information -->
                    <div class="flex-grow">
                        <h2 class="text-4xl font-extrabold text-gray-900 mb-3">
                            {manga.title || 'Unknown Title'}
                        </h2>
                        
                        <div class="space-y-2 mb-4">
                            <p class="text-lg text-gray-700">
                                <span class="font-semibold">ID:</span> {manga.id || 'N/A'}
                            </p>
                            <p class="text-lg text-gray-700">
                                <span class="font-semibold">Status:</span> {manga.status || 'N/A'}
                            </p>
                            <p class="text-lg text-gray-700">
                                <span class="font-semibold">Author:</span> {manga.author || 'N/A'}
                            </p>
                            <p class="text-lg text-gray-700">
                                <span class="font-semibold">Release Date:</span> {manga.releaseDate || 'N/A'}
                            </p>
                            <p class="text-lg text-gray-700">
                                <span class="font-semibold">Total Chapters:</span> {manga.totalChapters || 'N/A'}
                            </p>
                        </div>

                        {#if manga.genres && manga.genres.length > 0}
                            <div class="mb-4">
                                <span class="font-semibold text-lg text-gray-700">Genres:</span>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    {#each manga.genres as genre}
                                        <span class="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                            {genre}
                                        </span>
                                    {/each}
                                </div>
                            </div>
                        {/if}

                        {#if manga.description}
                            <div class="mb-6">
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">Description:</h3>
                                <p class="text-gray-600 leading-relaxed text-base">
                                    {manga.description}
                                </p>
                            </div>
                        {/if}

                        <!-- Chapters List -->
                        {#if manga.chapters && manga.chapters.length > 0}
                            <div class="mt-6">
                                <h3 class="text-xl font-semibold text-gray-800 mb-3">Chapters:</h3>
                                <div class="max-h-64 overflow-y-auto border rounded-lg">
                                    {#each manga.chapters.slice().reverse() as chapter, index}
                                        <button 
                                            class="w-full p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors text-left focus:outline-none focus:bg-purple-50 active:bg-purple-100"
                                            on:click={() => readChapter(chapter.id)}
                                        >
                                            <div class="flex justify-between items-center">
                                                <span class="font-medium text-gray-900">
                                                    Chapter {chapter.chapterNumber || (manga.chapters.length - index)}
                                                </span>
                                                <div class="flex items-center space-x-2">
                                                    <span class="text-sm text-gray-500">
                                                        {chapter.id}
                                                    </span>
                                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            {#if chapter.title}
                                                <p class="text-sm text-gray-600 mt-1">{chapter.title}</p>
                                            {/if}
                                            {#if chapter.releaseDate}
                                                <p class="text-xs text-gray-500 mt-1">Released: {new Date(chapter.releaseDate).toLocaleDateString()}</p>
                                            {/if}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            {:else}
                <div class="text-center py-10">
                    <p class="text-red-600 text-xl font-semibold">
                        {manga_id ? 'Manga not found or an error occurred. Please check the ID.' : 'No manga ID provided.'}
                    </p>
                    {#if manga_id}
                        <p class="text-gray-500 mt-2">Manga ID: {manga_id}</p>
                    {/if}
                </div>
            {/if}
        {:catch error}
            <div class="text-center py-10">
                <p class="text-red-600 text-xl font-semibold">An error occurred while fetching manga details.</p>
                <p class="text-gray-500 mt-2">Error: {error.message}</p>
                <button 
                    class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    on:click={() => mangaDetailsPromise = getMangaDetails(manga_id)}
                >
                    Try Again
                </button>
            </div>
        {/await}
    </div>
</div>

<style>
    .manga-cover {
        width: 100%;
        max-width: 300px;
        height: auto;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    /* Custom scrollbar for chapters list */
    .max-h-64::-webkit-scrollbar {
        width: 6px;
    }
    
    .max-h-64::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    .max-h-64::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
    }
    
    .max-h-64::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
    }
</style>