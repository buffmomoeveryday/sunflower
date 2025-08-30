import { API_KEY } from '$lib/utils.js';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const search = formData.get('search');
    const page = formData.get('page') || 1;

    if (!search) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing search query' }),
        { status: 400 }
      );
    }

    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(search)}&page=${page}&include_adult=false&language=en-US&api_key=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        searchResults: data.results,
        total_pages: data.total_pages,
        current_page: data.page
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch from TMDB' }),
      { status: 500 }
    );
  }
}
