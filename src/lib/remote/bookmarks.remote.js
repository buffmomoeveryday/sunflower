import { command } from '$app/server'
import * as v from 'valibot'


const bookmarkMovieObject = v.object({
    tmdb_id: v.string(),
    poster_path: v.string(),
    title: v.string(),
    vote_average: v.decimal(),
    release_date: v.isoDate(),
    genre_ids:v.array(),

})


export const bookmarkMovie = command(bookmarkMovieObject, async ({ tmdb_id, poster_path, title, vote_average, release_date, genre_ids }) => {
    console.log(tmdb_id)
})