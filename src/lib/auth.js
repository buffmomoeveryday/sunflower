import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from '../db/db.js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '../db/schema';

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true
	},
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: schema
	})
});
