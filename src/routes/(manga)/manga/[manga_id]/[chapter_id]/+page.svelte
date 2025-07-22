<script>

    import {page} from '$app/stores';
    import { MANGA } from '@consumet/extensions';
	import MangaDex from '@consumet/extensions/dist/providers/manga/mangadex';

    const chapter_id = $page.params.chapter_id

    const mangadex = new MANGA.MangaDex()

    async function fetchChapterPages(chapterId) {
        try {
            const chapterPromise = mangadex.fetchChapterPages(chapterId)
            const chapter = await chapterPromise;
            return chapter
        } catch (error) {
            console.error('Error fetching chapter pages:', error);
            return [];
        }
    }

    let chapterPagesPromise = fetchChapterPages(chapter_id);

</script>


{#await chapterPagesPromise}
    Loading chapter pages...
{:then chapters} 
    {#each chapters as chatper }
        <img src="{chatper.img}"  alt="{chatper}"/>
    {/each}    
{:catch}
Failed to Fetch
{/await}

helo