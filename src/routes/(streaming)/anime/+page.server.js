import { error } from '@sveltejs/kit';
import { fetchWithCache,API_KEY } from '$lib/utils.js';



const fetchAnime = async () => {
  const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
        }
        siteUrl
        episodes
        description(asHtml: false)
        averageScore
        popularity
      startDate {
        year
      }
      }
    }
  }
  `;

const variables = {
  page:1,
  perPage:50
};

try {
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  const json = await response.json();
  return json.data.Page.media;
} catch (error) {
  console.error('Error fetching trending anime:', error);
}

}





export async function load({ parms }) {
 
  return {
    "animeData": await fetchAnime()
  }
}