import { command,getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { db } from '../db/db.js';
import {
	moviesBookmark,
	moviesWatchHistory,
	seriesBookmark,
	animesBookmark,
	seriesWatchHistory,
	animesWatchHistory
} from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const movieObject = v.object({
	id: v.union([v.string(), v.number()]),
	poster_path: v.string(),
	title: v.string(),
	vote_average: v.union([v.string(), v.number()]),
	release_date: v.string(),
	genre_ids: v.array(v.union([v.string(), v.number()]))
});

const seriesObject = v.object({
	tmdb_id: v.union([v.string(), v.number()]),
	poster_path: v.string(),
	name: v.string(),
	vote_average: v.union([v.string(), v.number()]),
	first_air_date: v.optional(v.string(), ""),
	number_of_seasons: v.union([v.string(), v.number()])
});

const animeObject = v.object({
	tmdb_id: v.union([v.string(), v.number()]),
	poster: v.string(),
	name: v.string(),
	title: v.string(),
	vote: v.union([v.string(), v.number()]),
	start_date: v.optional(v.string(), ""),
	episodes: v.union([v.string(), v.number()])
});

// --- Movie Commands ---
export const toggleMovieBookmark = command(
	movieObject,
	async (
		{ id: tmdbId, poster_path, title, vote_average, release_date, genre_ids },
	) => {
		const event = getRequestEvent();
		const user = event.locals.user;
		if (!user) return { success: false, error: 'User not authenticated' };

		try {
			const existing = await db
				.select()
				.from(moviesBookmark)
				.where(
					and(eq(moviesBookmark.tmdbId, tmdbId.toString()), eq(moviesBookmark.userId, user.id))
				)
				.get();

			if (existing) {
				await db.delete(moviesBookmark).where(eq(moviesBookmark.id, existing.id));
				return { success: true, action: 'removed' };
			} else {
				await db.insert(moviesBookmark).values({
					id: crypto.randomUUID(),
					userId: user.id,
					tmdbId: tmdbId.toString(),
					posterPath: poster_path,
					title: title,
					voteAverage: vote_average.toString(),
					releaseDate: release_date,
					genreIds: JSON.stringify(genre_ids)
				});
				return { success: true, action: 'added' };
			}
		} catch (err) {
			console.error('Error toggling movie bookmark:', err);
			return { success: false, error: 'Database error' };
		}
	}
);

export const isMovieBookmarked = command(
	v.union([v.string(), v.number()]),
	async (tmdbId) => {
		const event = getRequestEvent();
		const user = event.locals.user;
		if (!user) return false;
		try {
			const existing = await db
				.select()
				.from(moviesBookmark)
				.where(
					and(eq(moviesBookmark.tmdbId, tmdbId.toString()), eq(moviesBookmark.userId, user.id))
				)
				.get();
			return !!existing;
		} catch (err) {
			return false;
		}
	}
);

export const addToMovieHistory = command(movieObject, async (movie) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	try {
		const existing = await db
			.select()
			.from(moviesWatchHistory)
			.where(
				and(
					eq(moviesWatchHistory.tmdbId, movie.id.toString()),
					eq(moviesWatchHistory.userId, user.id)
				)
			)
			.get();
		if (!existing) {
			await db.insert(moviesWatchHistory).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId: movie.id.toString(),
				posterPath: movie.poster_path,
				title: movie.title,
				voteAverage: movie.vote_average.toString(),
				releaseDate: movie.release_date,
				genreIds: JSON.stringify(movie.genre_ids)
			});
		}
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

// --- Series Commands ---
export const toggleSeriesBookmark = command(seriesObject, async (series) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false, error: 'User not authenticated' };
	const tmdbId = series.tmdb_id.toString();

	try {
		const existing = await db
			.select()
			.from(seriesBookmark)
			.where(and(eq(seriesBookmark.tmdbId, tmdbId), eq(seriesBookmark.userId, user.id)))
			.get();

		if (existing) {
			await db.delete(seriesBookmark).where(eq(seriesBookmark.id, existing.id));
			return { success: true, action: 'removed' };
		} else {
			await db.insert(seriesBookmark).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId,
				posterPath: series.poster_path,
				name: series.name,
				voteAverage: series.vote_average.toString(),
				firstAirDate: series.first_air_date,
				numberOfSeasons: Number(series.number_of_seasons)
			});
			return { success: true, action: 'added' };
		}
	} catch (err) {
		console.error('Error toggling series bookmark:', err);
		return { success: false, error: 'Database error' };
	}
});

export const isSeriesBookmarked = command(
	v.union([v.string(), v.number()]),
	async (tmdbId) => {
		const event = getRequestEvent();
		const user = event.locals.user;
		if (!user) return false;
		try {
			const existing = await db
				.select()
				.from(seriesBookmark)
				.where(and(eq(seriesBookmark.tmdbId, tmdbId.toString()), eq(seriesBookmark.userId, user.id)))
				.get();
			return !!existing;
		} catch (err) {
			return false;
		}
	}
);

export const addToSeriesHistory = command(seriesObject, async (series) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	const tmdbId = series.tmdb_id.toString();
	try {
		const existing = await db
			.select()
			.from(seriesWatchHistory)
			.where(and(eq(seriesWatchHistory.tmdbId, tmdbId), eq(seriesWatchHistory.userId, user.id)))
			.get();
		if (!existing) {
			await db.insert(seriesWatchHistory).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId,
				posterPath: series.poster_path,
				name: series.name,
				voteAverage: series.vote_average.toString(),
				firstAirDate: series.first_air_date,
				numberOfSeasons: Number(series.number_of_seasons)
			});
		}
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

// --- Anime Commands ---
export const toggleAnimeBookmark = command(animeObject, async (anime) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false, error: 'User not authenticated' };
	const tmdbId = anime.tmdb_id.toString();

	try {
		const existing = await db
			.select()
			.from(animesBookmark)
			.where(and(eq(animesBookmark.tmdbId, tmdbId), eq(animesBookmark.userId, user.id)))
			.get();

		if (existing) {
			await db.delete(animesBookmark).where(eq(animesBookmark.id, existing.id));
			return { success: true, action: 'removed' };
		} else {
			await db.insert(animesBookmark).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId,
				poster: anime.poster,
				name: anime.name,
				vote: anime.vote.toString(),
				startDate: anime.start_date,
				title: anime.title,
				episodes: Number(anime.episodes)
			});
			return { success: true, action: 'added' };
		}
	} catch (err) {
		console.error('Error toggling anime bookmark:', err);
		return { success: false, error: 'Database error' };
	}
});

export const isAnimeBookmarked = command(
	v.union([v.string(), v.number()]),
	async (tmdbId) => {
		const event = getRequestEvent();
		const user = event.locals.user;
		if (!user) return false;
		try {
			const existing = await db
				.select()
				.from(animesBookmark)
				.where(and(eq(animesBookmark.tmdbId, tmdbId.toString()), eq(animesBookmark.userId, user.id)))
				.get();
			return !!existing;
		} catch (err) {
			return false;
		}
	}
);

export const addToAnimeHistory = command(animeObject, async (anime) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	const tmdbId = anime.tmdb_id.toString();
	try {
		const existing = await db
			.select()
			.from(animesWatchHistory)
			.where(and(eq(animesWatchHistory.tmdbId, tmdbId), eq(animesWatchHistory.userId, user.id)))
			.get();
		if (!existing) {
			await db.insert(animesWatchHistory).values({
				id: crypto.randomUUID(),
				userId: user.id,
				tmdbId,
				poster: anime.poster,
				name: anime.name,
				vote: anime.vote.toString(),
				startDate: anime.start_date,
				title: anime.title,
				episodes: Number(anime.episodes)
			});
		}
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

// --- Fetch & Remove Commands ---
export const getBookmarkedMovies = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(moviesBookmark)
			.where(eq(moviesBookmark.userId, user.id))
			.orderBy(desc(moviesBookmark.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.tmdbId,
			tmdb_id: m.tmdbId,
			poster_path: m.posterPath,
			vote_average: m.voteAverage,
			release_date: m.releaseDate,
			genre_ids: m.genreIds ? JSON.parse(m.genreIds) : []
		}));

	} catch (err) {
		return [];
	}
});

export const getBookmarkedSeries = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(seriesBookmark)
			.where(eq(seriesBookmark.userId, user.id))
			.orderBy(desc(seriesBookmark.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.id,
			tmdb_id: m.tmdbId,
			poster_path: m.posterPath,
			vote_average: m.voteAverage,
			first_air_date: m.firstAirDate,
			number_of_seasons: m.numberOfSeasons
		}));
	} catch (err) {
		return [];
	}
});

export const getBookmarkedAnime = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(animesBookmark)
			.where(eq(animesBookmark.userId, user.id))
			.orderBy(desc(animesBookmark.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.id,
			tmdb_id: m.tmdbId
		}));
	} catch (err) {
		return [];
	}
});

export const getMoviesHistory = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(moviesWatchHistory)
			.where(eq(moviesWatchHistory.userId, user.id))
			.orderBy(desc(moviesWatchHistory.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.id, // Primary key for deletion
			tmdb_id: m.tmdbId,
			poster_path: m.posterPath,
			title: m.title,
			vote_average: m.voteAverage,
			release_date: m.releaseDate,
			genre_ids: m.genreIds ? JSON.parse(m.genreIds) : []
		}));

	} catch (err) {
		return [];
	}
});

export const getSeriesHistory = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(seriesWatchHistory)
			.where(eq(seriesWatchHistory.userId, user.id))
			.orderBy(desc(seriesWatchHistory.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.id,
			tmdb_id: m.tmdbId,
			poster_path: m.posterPath,
			vote_average: m.voteAverage,
			first_air_date: m.firstAirDate,
			number_of_seasons: m.numberOfSeasons
		}));
	} catch (err) {
		return [];
	}
});

export const getAnimeHistory = command(v.any(), async () => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return [];
	try {
		const results = await db
			.select()
			.from(animesWatchHistory)
			.where(eq(animesWatchHistory.userId, user.id))
			.orderBy(desc(animesWatchHistory.createdAt))
			.all();
		return results.map((m) => ({
			...m,
			id: m.id,
			tmdb_id: m.tmdbId
		}));
	} catch (err) {
		return [];
	}
});

export const removeMovieHistory = command(v.string(), async (id) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	try {
		await db.delete(moviesWatchHistory).where(and(eq(moviesWatchHistory.id, id), eq(moviesWatchHistory.userId, user.id)));
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

export const removeSeriesHistory = command(v.string(), async (id) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	try {
		await db.delete(seriesWatchHistory).where(and(eq(seriesWatchHistory.id, id), eq(seriesWatchHistory.userId, user.id)));
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});

export const removeAnimeHistory = command(v.string(), async (id) => {
	const event = getRequestEvent();
	const user = event.locals.user;
	if (!user) return { success: false };
	try {
		await db.delete(animesWatchHistory).where(and(eq(animesWatchHistory.id, id), eq(animesWatchHistory.userId, user.id)));
		return { success: true };
	} catch (err) {
		return { success: false };
	}
});