<script>
    import { MANGA } from '@consumet/extensions';
    import { writable } from 'svelte/store'

    import { onMount,setContext,getContext } from 'svelte';
    const mangadex = new MANGA.MangaDex();

    let query =  $state(getContext("query")||"")
    let mangaResultsPromise = $state([])

    async function searchManga() {

        try {
            let data = await mangadex.search(query);
            mangaResultsPromise = data.results
        } catch (error) {
            console.error("Error fetching manga:", error);
            return []; 
        }
    }

    // setContext("query",query)

    


</script>


<input bind:value={query} onchange="{searchManga}" placeholder="Search Manga" class="border border-blue-500 pt-20 "/>

{#await mangaResultsPromise}
    <p>Loading manga results...</p>
{:then results}
    {#if results && results.length > 0}
        <ul>
            {#each results as manga}
                <li>
                    <a href="/manga/{manga.id}">
                    <h3>{manga.title}</h3>
                    <p>ID: {manga.id}</p>
                    <p>Status: {manga.status}</p>
                    {#if manga.image}
                        <img src={manga.image} alt={manga.title} style="width: 100px; height: auto;">
                    {/if}
                </a>
                    </li>
                    {/each}
        </ul>
    {:else}
        {#if query}
        <p>No results found for {query}.</p>
        {:else}
            <p>Please enter a search query.</p>
        {/if}
    {/if}

    {:catch error}
    <p style="color: red;">An error occurred: {error.message}</p>
{/await}