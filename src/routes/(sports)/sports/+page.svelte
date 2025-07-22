<script>
    import { onMount } from 'svelte';
	import MatchCard from '$lib/components/sports/MatchCard.svelte';


    const matchesLiveAPIUrl = 'https://streamed.su/api/matches/live ';
    const matchesTodayAPIUrl = 'https://streamed.su/api/matches/all-today ';

    let matchesLive = $state(null);
    let matchesToday = $state(null);

    let football = $state([]);
    let cricket = $state([]);
    let basketball = $state([]);





    onMount(async () => {
        try {
            const matchesLiveResponse = await fetch(matchesLiveAPIUrl);
            if (!matchesLiveResponse.ok) throw new Error('Failed to fetch live matches');
            matchesLive = await matchesLiveResponse.json();

            const matchesTodayResponse = await fetch(matchesTodayAPIUrl);
            if (!matchesTodayResponse.ok) throw new Error("Failed to fetch today's matches");
            matchesToday = await matchesTodayResponse.json();

            football = matchesLive.filter((match) => match.category === 'football');
            cricket = matchesLive.filter((match) => match.category === 'cricket');
            basketball = matchesLive.filter((match) => match.category === 'basketball');
        } catch (error) {
            console.error('Error fetching match data:', error);
        }
    });
</script>

<style>
    .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .aspect-\[2\/3\] {
        aspect-ratio: 2 / 3;
    }

    @supports not (aspect-ratio: 2/3) {
        .aspect-\[2\/3\] {
            padding-bottom: 150%;
        }
    }
</style>



<!-- Layout Section -->

<div class="container px-4 py-8 mx-auto space-y-12">
    <section>
        <h2 class="text-3xl font-bold mb-6 text-white">⚽ Football Matches</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each football as match}
			<MatchCard match={match} />
            {/each}
        </div>
    </section>

    <section>
        <h2 class="text-3xl font-bold mb-6 text-white">🏏 Cricket Matches</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each cricket as match}
			<MatchCard match={match} />
            {/each}
        </div>
    </section>

    <section>
        <h2 class="text-3xl font-bold mb-6 text-white">🏀 Basketball Matches</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each basketball as match}
			<MatchCard match={match} />
            {/each}
        </div>
    </section>
</div>