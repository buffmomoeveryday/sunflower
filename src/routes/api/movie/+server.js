import { json } from '@sveltejs/kit';
import { fetchWithCache, API_KEY } from '$lib/utils.js';

const BASE_URL_SEARCH = "https://api.themoviedb.org/3";
const ANILIST_URL = "https://graphql.anilist.co";

// AniList GraphQL query for anime search
// AniList GraphQL query for anime search
const ANILIST_SEARCH_QUERY = `
query ($search: String!, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(search: $search, type: ANIME, sort: $sort) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        medium
      }
      bannerImage
      description
      episodes
      duration
      status
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      season
      seasonYear
      averageScore
      popularity
      genres
      studios {
        nodes {
          name
        }
      }
      format
      source
      trailer {
        id
        site
        thumbnail
      }
      isAdult
    }
  }
}

`;
// Transform AniList data to match your component structure
const transformAniListData = (anilistData) => {

  return anilistData.map(anime => ({
    id: anime.id,
    title: anime.title.english || anime.title.romaji || anime.title.native,
    original_title: anime.title.native,
    overview: anime.description ? anime.description.replace(/<[^>]*>/g, '') : '',
    poster_path: anime.coverImage.large || anime.coverImage.medium,
    backdrop_path: anime.bannerImage,
    release_date: anime.startDate ? `${anime.startDate.year}-${String(anime.startDate.month || 1).padStart(2, '0')}-${String(anime.startDate.day || 1).padStart(2, '0')}` : '',
    first_air_date: anime.startDate ? `${anime.startDate.year}-${String(anime.startDate.month || 1).padStart(2, '0')}-${String(anime.startDate.day || 1).padStart(2, '0')}` : '',
    vote_average: anime.averageScore ? anime.averageScore / 10 : 0,
    popularity: anime.popularity || 0,
    genre_ids: anime.genres || [],
    adult: anime.isAdult || false,
    original_language: 'ja',
    video: false,
    // Additional anime-specific fields
    episodes: anime.episodes,
    duration: anime.duration,
    status: anime.status,
    season: anime.season,
    season_year: anime.seasonYear,
    format: anime.format,
    source: anime.source,
    studios: anime.studios.nodes.map(studio => studio.name),
    trailer: anime.trailer,
    // For compatibility with your existing components
    name: anime.title.english || anime.title.romaji || anime.title.native,
    original_name: anime.title.native,
    image: anime.coverImage.large || anime.coverImage.medium,
    coverImage: anime.coverImage
  }));
};

// Search anime using AniList API
const searchAnime = async (searchQuery, page = 1, year = null) => {
  try {
    const variables = {
      search: searchQuery,
      page: page,
      perPage: 20,
      sort: ["POPULARITY_DESC"]
    };

    if (year) {
      variables.year = parseInt(year);
    }

    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: ANILIST_SEARCH_QUERY,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`AniList GraphQL error: ${data.errors[0].message}`);
    }

    const transformedResults = transformAniListData(data.data.Page.media);
    
    return {
      results: transformedResults,
      total_pages: data.data.Page.pageInfo.lastPage,
      total_results: data.data.Page.pageInfo.total,
      page: data.data.Page.pageInfo.currentPage
    };
  } catch (error) {
    console.error('AniList search error:', error);
    throw error;
  }
};

// Enhanced TMDB search with better error handling
const searchTMDB = async (searchQuery, videoType, page, year, sortBy, bollywood) => {
  try {
    let url = '';
    
    if (videoType === 'anime') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&page=${page}&with_genres=16&with_keywords=210024|287501&with_text_query=${encodeURIComponent(searchQuery)}&include_adult=false`;
      
      if (year) {
        url += `&first_air_date_year=${year}`;
      }
    } else {
      // Regular TMDB search
      url = `${BASE_URL_SEARCH}/search/${videoType}?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}`;
      
      if (year) {
        url += `&year=${year}`;
      }
      
      if (bollywood && videoType === 'movie') {
        url += '&region=IN&with_original_language=hi';
      }
    }

    const cacheKey = `search=${encodeURIComponent(searchQuery)}&page=${page}&type=${videoType}&year=${year || ''}&sort=${sortBy || ''}&bollywood=${bollywood || ''}`;
    
    const searchResults = await fetchWithCache(url, cacheKey);
    
    return {
      results: searchResults.results || [],
      total_pages: searchResults.total_pages || 1,
      total_results: searchResults.total_results || 0,
      page: searchResults.page || page
    };
  } catch (error) {
    console.error('TMDB search error:', error);
    throw error;
  }
};

export async function POST(event) {
    try {
        const data = await event.request.formData();
        const search = data.get('search');
        const page = parseInt(data.get('page')) || 1;
        const videoType = data.get("videoType");
        const year = data.get('year');
        const sortBy = data.get('sortBy');
        const bollywood = data.get('bollywood') === 'true';

        if (!search || !search.trim()) {
            return json({ 
                success: false, 
                error: "Search query is required" 
            });
        }

        const searchQuery = search.trim();
        let searchResults;

        if (videoType === 'anime') {
            try {
                searchResults = await searchAnime(searchQuery, page, year);
            } catch (anilistError) {
                console.warn('AniList search failed, falling back to TMDB:', anilistError);
                searchResults = await searchTMDB(searchQuery, videoType, page, year, sortBy, bollywood);
            }
        } else {
            // Use TMDB for movies and TV series
            searchResults = await searchTMDB(searchQuery, videoType, page, year, sortBy, bollywood);
        }

        // Filter out results without images
        const filteredResults = searchResults.results.filter(item => {
            if (videoType === 'anime') {
                return item.poster_path || item.image || item.coverImage;
            }
            return item.poster_path;
        });

        return json({
            success: true,
            searchResults: filteredResults,
            total_pages: searchResults.total_pages,
            total_results: searchResults.total_results,
            current_page: searchResults.page,
            source: videoType === 'anime' ? 'anilist' : 'tmdb'
        });

    } catch (error) {
        console.error('Search API error:', error);
        
        return json({ 
            success: false, 
            error: error.message === 'Failed to fetch' 
                ? "Network error. Please check your connection and try again."
                : "Failed to fetch search results. Please try again."
        });
    }
}

// Optional: Add a GET endpoint for search suggestions
export async function GET(event) {
    const url = new URL(event.request.url);
    const query = url.searchParams.get('q');
    const type = url.searchParams.get('type') || 'tv';
    
    if (!query || query.length < 2) {
        return json({ suggestions: [] });
    }

    try {
        let suggestions = [];
        
        if (type === 'anime') {
            // Get anime suggestions from AniList
            const anilistSuggestions = await fetch(ANILIST_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        query ($search: String!) {
                            Page(page: 1, perPage: 20) {
                                media(search: $search, type: ANIME) {
                                    title {
                                        romaji
                                        english
                                    }
                                   
                            }
                        }
                    `,
                    variables: { search: query }
                })
            });
            
            const anilistData = await anilistSuggestions.json();
            suggestions = anilistData.data?.Page?.media?.map(anime => 
                anime.title.english || anime.title.romaji
            ) || [];
        } else {
            // Get suggestions from TMDB
            const tmdbUrl = `${BASE_URL_SEARCH}/search/${type}?query=${encodeURIComponent(query)}&api_key=${API_KEY}&page=1`;
            const tmdbResponse = await fetch(tmdbUrl);
            const tmdbData = await tmdbResponse.json();
            
            suggestions = tmdbData.results?.slice(0, 5).map(item => 
                item.title || item.name
            ) || [];
        }
        
        return json({ suggestions });
    } catch (error) {
        console.error('Suggestions error:', error);
        return json({ suggestions: [] });
    }
}