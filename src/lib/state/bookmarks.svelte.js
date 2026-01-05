let bookmarks = $state({
	movies: {},
	series: {},
	anime: {}
});

export function setBookmarks(data) {
	const movies = {};
	const series = {};
	const anime = {};
	
	data.movies.forEach(id => movies[String(id)] = true);
	data.series.forEach(id => series[String(id)] = true);
	data.anime.forEach(id => anime[String(id)] = true);
	
	bookmarks.movies = movies;
	bookmarks.series = series;
	bookmarks.anime = anime;
}

export function isMovieBookmarkedLocal(id) {
	return !!bookmarks.movies[String(id)];
}

export function isSeriesBookmarkedLocal(id) {
	return !!bookmarks.series[String(id)];
}

export function isAnimeBookmarkedLocal(id) {
	return !!bookmarks.anime[String(id)];
}

export function addBookmarkLocal(type, id) {
	if (type === 'movie') bookmarks.movies[String(id)] = true;
	if (type === 'series') bookmarks.series[String(id)] = true;
	if (type === 'anime') bookmarks.anime[String(id)] = true;
}

export function removeBookmarkLocal(type, id) {
	if (type === 'movie') delete bookmarks.movies[String(id)];
	if (type === 'series') delete bookmarks.series[String(id)];
	if (type === 'anime') delete bookmarks.anime[String(id)];
}
