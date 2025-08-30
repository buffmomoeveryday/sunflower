<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    import { Heart } from 'lucide-svelte';
    import { PersistedState } from 'runed';
    import { db } from '$lib/db/db.js'
	import MovieCard from '$lib/components/card/MovieCard.svelte';

    let { data } = $props();
    let isAddedToHome = $state(false);

    let user = data?.user;
    let movie_data = data.movieData;
    let movie_id = $page.params.movie_id;
    let recommendation_data = data.recommendation_data;
    
    const HOME_STORAGE_KEY = 'homepage_movies';
    const safeMovieId = String(movie_id).trim();

    let iframeSources = $state([
        `https://vidsrc.icu/embed/movie/${safeMovieId}`,
        `https://vidsrc.to/embed/movie/${safeMovieId}`,
        `https://vidsrc.cc/v2/embed/movie/${safeMovieId}?autoPlay=true`,
        `https://player.videasy.net/movie/${safeMovieId}`,
        `https://player.autoembed.cc/embed/movie/${safeMovieId}`,
        `https://111movies.com/movie/${safeMovieId}`,
        `https://vidjoy.pro/embed/movie/${safeMovieId}`,
        `https://mappletv.uk/watch/movie/${safeMovieId}`,
        `https://embed.rgshows.me/api/3/movie/?id=${safeMovieId}`,
        `https://vidfast.pro/movie/${safeMovieId}?autoPlay=true`,
        `https://embed.rgshows.me/api/2/movie/?id=${safeMovieId}`
    ]);

    const selectedSource = new PersistedState(`selected_source_${movie_id}`,0)
    
    function changeSource(index) {
        selectedSource.current = index;
    }

    async function fetchMovieWatchlistStatus() {
        if (!user) return;
        try {
            const response = await fetch(`/api/movie/watchlist/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, tmdb_id: safeMovieId })
            });
            if (!response.ok) {
                if (response.status === 404) {
                    isAddedToHome = false;
                    return;
                }
                throw new Error(`Failed to fetch watchlist status: ${response.statusText}`);
            }
            const data = await response.json();
            isAddedToHome = !!data?.id;
        } catch (error) {
            console.error('Error fetching watchlist status:', error);
            isAddedToHome = false;
        }
    }

    async function toggleHomeStatus() {
        if (!user) return;
        try {
            const postData = {
                user_id: user.id,
                tmdb_id: movie_data.id,
                title: movie_data.title,
                poster_path: movie_data.poster_path,
                average_ratings: movie_data.vote_average
            };

            const action = isAddedToHome ? 'remove' : 'add';
            const method = action === 'add' ? 'POST' : 'DELETE';

            const response = await fetch('/api/movie/watchlist/save', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    action === 'add'
                        ? postData
                        : { user_id: user.id, tmdb_id: movie_data.id }
                )
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || `Failed to ${action} from watchlist`);
            }

            const storedMovies = JSON.parse(localStorage.getItem(HOME_STORAGE_KEY) || '[]');
           
            if (action === 'add') {
                const movieToAdd = {
                    id: movie_data.id,
                    name: movie_data.title,
                    poster_path: movie_data.poster_path,
                    first_air_date: movie_data.release_date,
                    vote_average: movie_data.vote_average,
                    addedAt: new Date().toISOString()
                };
                if (!storedMovies.some(m => m.id === movie_data.id)) {
                    storedMovies.push(movieToAdd);
                    localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(storedMovies));
                    toast.success('Added to Home');
                    isAddedToHome = true;
                }
            } else {
                const updatedMovies = storedMovies.filter(m => m.id !== movie_data.id);
                localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(updatedMovies));
                toast.success('Removed from Home');
                isAddedToHome = false;
            }
        } catch (error) {
            console.error(error);
            toast.error('Action failed. Try again.');
        }
    }

    onMount(() => {
            setTimeout(async () => {
                try {
                    let movie = await db.movies_watch_history.where('tmdb_id').equals(movie_data.id).first();
                    if (!movie){
                    await db.movies_watch_history.add({
                        tmdb_id: movie_data.id,
                        poster_path: movie_data.poster_path,
                        title: movie_data.title,
                        vote_average: movie_data.vote_average,
                        release_date: movie_data.release_date,
                        genre_ids: movie_data.genre_ids,
                        addedAt: new Date().toISOString() 
                    });
                    }
                } catch (error) {
                }
            }, 5000); 
        });

     function handleMessage() {
        if (data.type === 'PLAYER_EVENT') {
        const { event, currentTime, duration } = data.data;
        console.log(`Player event: ${event} at ${currentTime}s of ${duration}s`);
        }
  }

</script>

<svelte:window on:message={handleMessage} />

<div class="flex flex-col min-h-screen bg-black text-white overflow-x-hidden">
    <!-- Main Responsive Layout -->
    <div class="flex flex-col lg:flex-row flex-1 p-2 sm:p-4 md:p-6 gap-4 md:gap-6 min-h-0">
        <!-- Movie Details (Sidebar on desktop, below player on mobile) -->
        <div class="w-full lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
            <!-- Title & Release Date -->
            <div class="mb-4">
                <h1 class="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                    {movie_data.title || movie_data.original_title}
                </h1>
                <p class="text-gray-400 text-sm">{movie_data.release_date?.split('-')[0] || 'N/A'}</p>
            </div>

            <!-- Mobile Layout -->
            <div class="lg:hidden mb-6">
                <div class="flex gap-3 sm:gap-4">
                    <!-- Poster -->
                    <div class="flex-shrink-0 w-24 sm:w-32">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie_data.poster_path}`}
                            alt={`${movie_data.title} Poster`}
                            class="w-full rounded-lg shadow-lg border border-gray-700"
                            loading="lazy"
                        />
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        {#if user}
                            <button
                                onclick={toggleHomeStatus}
                                class="w-full flex items-center justify-center gap-2 px-2 py-2 mb-3 text-xs font-medium rounded-lg bg-black border border-gray-700 hover:bg-gray-900 transition"
                                aria-label={isAddedToHome ? 'Remove from Home' : 'Add to Home'}
                            >
                                <Heart size={16} color={isAddedToHome ? '#fb2c36' : 'white'} fill={isAddedToHome ? '#fb2c36' : 'none'} />
                                <span>{isAddedToHome ? 'Added' : 'Add'}</span>
                            </button>
                        {/if}

                        <!-- Genres -->
                        <div class="bg-gray-900 rounded-lg p-2">
                            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Genres</h4>
                            <div class="flex flex-wrap gap-1">
                                {#each movie_data.genres as genre (genre.id)}
                                    <span class="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300">
                                        {genre.name}
                                    </span>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Overview (Full width) -->
                <div class="bg-gray-900 rounded-lg p-3 mt-3">
                    <h3 class="text-base font-semibold mb-2">Overview</h3>
                    <p class="text-gray-300 text-sm leading-relaxed line-clamp-5">{movie_data.overview}</p>
                </div>
            </div>

            <!-- Desktop Layout -->
            <div class="hidden lg:block">
                <img
                    src={`https://image.tmdb.org/t/p/w500${movie_data.poster_path}`}
                    alt={`${movie_data.title} Poster`}
                    class="w-full h-auto rounded-lg shadow-lg border border-gray-700 mb-4"
                    loading="lazy"
                />

                {#if user}
                    <button
                        onclick={toggleHomeStatus}
                        class="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 text-sm font-medium rounded-lg bg-black border border-gray-700 hover:bg-gray-900 transition"
                        aria-label={isAddedToHome ? 'Remove from Home' : 'Add to Home'}
                    >
                        <Heart size={20} color={isAddedToHome ? '#fb2c36' : 'white'} fill={isAddedToHome ? '#fb2c36' : 'none'} />
                        <span>{isAddedToHome ? 'Added to Home' : 'Add to Home'}</span>
                    </button>
                {/if}

                <div class="bg-gray-900 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Overview</h3>
                    <p class="text-gray-300 text-sm leading-relaxed line-clamp-8">{movie_data.overview}</p>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 mt-4">
                    <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Genres</h4>
                    <div class="flex flex-wrap gap-2">
                        {#each movie_data.genres as genre (genre.id)}
                            <span class="px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded-full text-gray-300">
                                {genre.name}
                            </span>
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Video Player & Server Controls (Stacked vertically) -->
        <div class="flex-1 flex flex-col min-h-0 order-1 lg:order-2">
            <!-- Video Player -->
            <div class="flex-1 relative bg-gray-900 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden min-h-[180px] sm:min-h-[280px] md:min-h-[400px]">
                <iframe
                    src={iframeSources[selectedSource.current]}
                    class="absolute inset-0 w-full h-full"
                    allow="encrypted-media; fullscreen"
                    allowfullscreen
                    loading="lazy"
                    title="Movie Player"
                    referrerpolicy="no-referrer"
                ></iframe>
            </div>

            <!-- Server Selection - Always Directly Below Player -->
            <div class="mt-3 p-3 bg-gray-900 rounded-lg">
                <div class="flex items-center flex-wrap gap-2">
                    <span class="text-xs font-medium text-gray-400 whitespace-nowrap">Server:</span>
                    <div class="flex flex-wrap gap-1.5 flex-1 min-w-0">
                        {#each iframeSources as _, index}
                            <button
                                onclick={() => changeSource(index)}
                                class={`px-2.5 py-1.5 text-xs font-medium rounded-lg min-w-[32px] text-center transition ${
                                    index === selectedSource.current
                                        ? 'bg-white text-black shadow'
                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                }`}
                                aria-pressed={index === selectedSource.current}
                            >
                                {index + 1}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recommendations Section -->
    {#if recommendation_data?.results && recommendation_data.results.length > 0}
        <div class="p-2 sm:p-4 md:p-6 pt-0">
            <div class="mb-6">
                <h2 class="text-xl sm:text-2xl font-bold mb-2">Recommended Movies</h2>
                <p class="text-gray-400 text-sm">More movies you might enjoy</p>
            </div>
            
            <!-- Horizontal Scrolling Grid -->
            <div class="relative">
                <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                    {#each recommendation_data.results.slice(0, 12) as movie (movie.id)}
                        <div class="flex-none w-48 sm:w-56">
                           
                            <MovieCard
                                id={movie.id}
                                poster_path={movie.poster_path}
                                title={movie.title}
                                vote_average={movie.vote_average}
                                release_date={movie.release_date}
                                genre_ids={movie.genre_ids}
                            />
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .line-clamp-5 {
        display: -webkit-box;
        -webkit-line-clamp: 5;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .line-clamp-8 {
        display: -webkit-box;
        -webkit-line-clamp: 8;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    /* Custom scrollbar styles */
    .scrollbar-thin {
        scrollbar-width: thin;
    }
    
    .scrollbar-track-gray-800::-webkit-scrollbar-track {
        background-color: #1f2937;
        border-radius: 9999px;
    }
    
    .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
        background-color: #4b5563;
        border-radius: 9999px;
    }
    
    .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb:hover {
        background-color: #6b7280;
    }
    
    ::-webkit-scrollbar {
        height: 8px;
    }
</style>