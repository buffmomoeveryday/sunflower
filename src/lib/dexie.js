import Dexie from 'dexie';

export const db = new Dexie('sunflower-watch-history');
db.version(1).stores({
    // 
    movies_watch_history: '++id, tmdb_id, poster_path,title,vote_average,release_date,genre_ids',
    movies_bookmark: '++id, tmdb_id, poster_path,title,vote_average,release_date,genre_ids',
    // 
    series_watch_history: '++id, tmdb_id, poster_path, name, vote_average, first_air_date, number_of_seasons',
    series_bookmark: '++id, tmdb_id, poster_path, name, vote_average, first_air_date, number_of_seasons',
    // 
    series_watch_history: '++id, tmdb_id,poster, name, vote, start_date, title,episodes',
    animes_bookmark: '++id, tmdb_id,poster, name, vote, start_date, title,episodes'
});