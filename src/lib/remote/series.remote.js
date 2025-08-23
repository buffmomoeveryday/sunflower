import * as v from "valibot";
import { error } from "@sveltejs/kit";
import { command } from "$app/server";
import { API_KEY } from "$lib/utils";

const BASE_URL = 'https://api.themoviedb.org/3';


const episodeObject = v.object({
  tvId: v.string(),
  seasonNumber: v.string(),
});


export const getEpisodes = command(episodeObject, async ({ tvId, seasonNumber }) => {
  try {
    if (!tvId || !seasonNumber) {
      return { success: false, error: 'TV ID and Season Number are required' };
    }

    const url = `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(url);

    if (!response.ok) return error('Network response was not ok');

    const seasonDetails = await response.json();
    return {
      success: true,
      episodes: seasonDetails.episodes,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch season episodes',
    };
  }
});
