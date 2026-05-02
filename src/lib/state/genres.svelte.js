import { setCurrentUser } from "$lib/state/user.svelte";
 
let movieGenres = $state([]);
let tvGenres = $state([]);
 
export function setMovieGenres(genres) {
	movieGenres = genres;
}
 
export function setTvGenres(genres) {
	tvGenres = genres;
}
 
export function getMovieGenres() {
	return movieGenres;
}
 
export function getTvGenres() {
	return tvGenres;
}
 
export function getGenreName(id, type = 'movie') {
	const genres = type === 'movie' ? movieGenres : tvGenres;
	const genre = genres.find(g => g.id === id);
	return genre ? genre.name : null;
}
 
export function getAllGenres() {
	const merged = [...movieGenres];
	tvGenres.forEach((g) => {
		if (!merged.find((m) => m.id === g.id)) merged.push(g);
	});
	return merged;
}
