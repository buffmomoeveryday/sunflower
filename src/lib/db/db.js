import { drizzle } from 'drizzle-orm/libsql';
import { TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const db = drizzle({
	connection: {
		url: TURSO_CONNECTION_URL,
		authToken: TURSO_AUTH_TOKEN
	}
});
