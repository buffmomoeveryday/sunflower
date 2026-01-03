import { API_KEY } from "$lib/utils";

export async function fetchGenres() {
    const movieUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;
    const tvUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=en-US`;

    try {
        const [movieRes, tvRes] = await Promise.all([
            fetch(movieUrl),
            fetch(tvUrl)
        ]);

        const [movieData, tvData] = await Promise.all([
            movieRes.json(),
            tvRes.json()
        ]);

        return {
            movieGenres: movieData.genres || [],
            tvGenres: tvData.genres || []
        };
    } catch (error) {
        console.error("Error fetching genres:", error);
        return { movieGenres: [], tvGenres: [] };
    }
}

export async function fetchDiscover(type, genreIds, yearFrom, yearTo, page = 1) {
    const baseUrl = `https://api.themoviedb.org/3/discover/${type === 'tv' ? 'tv' : 'movie'}`;
    let url = `${baseUrl}?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}&include_adult=false`;

    if (genreIds && genreIds.length > 0) {
        url += `&with_genres=${genreIds.join(',')}`;
    }

    if (yearFrom) {
        const dateStr = `${yearFrom}-01-01`;
        if (type === 'tv') {
            url += `&first_air_date.gte=${dateStr}`;
        } else {
            url += `&primary_release_date.gte=${dateStr}`;
        }
    }

    if (yearTo) {
        const dateStr = `${yearTo}-12-31`;
        if (type === 'tv') {
            url += `&first_air_date.lte=${dateStr}`;
        } else {
            url += `&primary_release_date.lte=${dateStr}`;
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) return { success: false, error: "Failed to fetch" };
        const data = await response.json();
        
        const results = data.results.map(item => ({
            ...item,
            media_type: type === 'tv' ? 'tv' : 'movie'
        }));

        return {
            success: true,
            searchResults: results,
            total_pages: data.total_pages,
            total_results: data.total_results
        };
    } catch (error) {
        console.error("Discover error:", error);
        return { success: false, error: error.message };
    }
}
