import { command, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { API_KEY } from "$lib/utils";
import * as v from "valibot";

const BASE_URL = 'https://api.themoviedb.org/3';

export const getMovieTrailer = command(v.string(), async (tmdb_id) => {
  try {
    const url = `${BASE_URL}/movie/${tmdb_id}/videos?language=en-US&api_key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw error(404, "TMDB request failed");

    const videos = await response.json();
    let trailer = null;

    for (const video of videos.results || []) {
      if (video.type === "Trailer" && video.site === "YouTube") {
        trailer = video.key;
        break;
      }
    }
      return trailer;
  } catch (err) {
     error(500, `Failed to fetch trailer: ${err.message || err}`);
  }
});

export const getSeriesTrailer = command(v.string(), async (tmdb_id) => {
  try {
    if (!tmdb_id) {
      error(400, "Missing tmdb_id in query params");
    }

    const [videosRes, detailsRes, reviewsRes] = await Promise.all([
      fetch(`${BASE_URL}/tv/${tmdb_id}/videos?language=en-US&api_key=${API_KEY}`),
      fetch(`${BASE_URL}/tv/${tmdb_id}?language=en-US&api_key=${API_KEY}`),
      fetch(`${BASE_URL}/tv/${tmdb_id}/reviews?language=en-US&api_key=${API_KEY}`)
    ]);

    if (!videosRes.ok || !detailsRes.ok || !reviewsRes.ok) {
      error(500, "TMDB request failed");
    }

    const [videos, details, reviews] = await Promise.all([
      videosRes.json(),
      detailsRes.json(),
      reviewsRes.json()
    ]);

    const trailerVideo = videos.results?.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    const trailer = trailerVideo ? trailerVideo.key : null;
    const reviewResults = reviews.results ?? [];


    return {
      trailer,
      details,
      reviews: reviewResults
    };
  } catch (err) {
    error(500, `Failed to fetch trailer: ${err.message || err}`);
  }
});