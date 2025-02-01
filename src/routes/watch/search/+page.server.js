
// import { env } from '$env/dynamic/private'; // Import environment variables
// import { fetchWithCache } from '$lib/utils.js';

// const BASE_URL_SEARCH = "https://api.themoviedb.org/3";


// let searchResults = []


// export const actions = {
//     default: async ({ request }) => {
//         const page = 1;
//         try {
//             const data = await request.formData();
//             const search = data.get('search');

//             if (!search) {
//                 return { success: false, error: "Search query is required" };
//             }
//             const url = `${BASE_URL_SEARCH}/search/movie?query=${encodeURIComponent(search)}&include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}`;
//             searchStore.searchResults = fetchWithCache(url, search);
//             return { success: true, searchResults };
//         } catch (error) {
//             return { success: false, error: "Failed to fetch search results" };
//         }
//     },
// };

