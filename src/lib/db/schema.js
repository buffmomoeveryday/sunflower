import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { title } from 'valibot';


// .......................
// User
// .......................
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' })
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
		.notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', {
		mode: 'timestamp'
	}),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', {
		mode: 'timestamp'
	}),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});


// .......................
// Bookmarks
// .......................
export const moviesBookmark = sqliteTable("movies_bookmark", {
  id: text("id").primaryKey(),
  tmdbId: text("tmdb_id").notNull(),
  posterPath: text("poster_path").notNull(),
  title: text("title").notNull(),
  voteAverage: text("vote_average").notNull(),
  releaseDate: text("release_date").notNull(),
  genreIds: text("genre_ids").notNull(),
});

export const seriesBookmark = sqliteTable("series_bookmark", {
	id: text("id").primaryKey(),
	tmdbId: text("tmdn_id").notNull(),
	posterPath: text("poster_path").notNull(),
	name: text("name").notNull(),
	voteAverage: text("vote_average").notNull(),
	firstAirDate: text("first_air_date").notNull(),
	numberOfSeason: integer("number_of_seasons").notNull(),
	
})


export const animesBookmark = sqliteTable("series_bookmark", {
	id: text("id").primaryKey(),
	tmdbId: text("tmdn_id").notNull(),
	posterPath: text("poster_path").notNull(),
	name: text("name").notNull(),
	voteAverage: text("vote_average").notNull(),
	firstAirDate: text("first_air_date").notNull(),
	numberOfSeason: integer("number_of_seasons").notNull(),
	
})