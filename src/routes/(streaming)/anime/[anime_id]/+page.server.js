async function fetchAnimeData(anime_id) {
	const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
            userPreferred
          }
          description(asHtml: true)
          episodes
          status
          genres
          coverImage {
            large
          }
          format
          duration
          averageScore
          popularity
          season
          seasonYear
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
          relations {
            edges {
              relationType
              node {
                id
                title {
                  romaji
                  english
                  userPreferred
                }
                type
                format
                coverImage {
                  medium
                }
              }
            }
          }
          characters(sort: ROLE) {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  large
                }
              }
              voiceActors(language: JAPANESE, sort: RELEVANCE) {
                id
                name {
                  full
                }
                languageV2
                image {
                  large
                }
              }
            }
          }
          staff(sort: RELEVANCE) {
            edges {
              role
              node {
                id
                name {
                  full
                }
                image {
                  large
                }
              }
            }
          }
          studios(isMain: true) {
            edges {
              node {
                id
                name
                isAnimationStudio
              }
            }
          }
        }
      }
    `;

	try {
		const res = await fetch('https://graphql.anilist.co', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query, variables: { id: anime_id } })
		});

		const data = await res.json();

		if (data.data && data.data.Media) {
			return data.data.Media;
		} else {
			console.error('Error fetching anime data:', data.errors);
		}
	} catch (error) {
		console.error('Network error:', error);
	}
}

export async function load({ params }) {
	let anime_id = params.anime_id;
	let anime_data = await fetchAnimeData(anime_id);
	return { anime_data };
}
