import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { fileURLToPath } from 'url';
import { TURSO_CONNECTION_URL,TURSO_AUTH_TOKEN } from '$env/static/private';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../../.env') });

export const db = drizzle({
	connection: {
		url: TURSO_CONNECTION_URL,
		authToken: TURSO_AUTH_TOKEN
	}
});
