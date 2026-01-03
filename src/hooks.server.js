// middleware

import PocketBase from 'pocketbase';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { fetchWithCache, POCKETBASE_URL } from '$lib/utils';
import { auth } from "$lib/auth/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";

const url = POCKETBASE_URL;
const protectedPrefix = ['/profile'];



export const  authHandler = async ({ event, resolve }) =>{
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
}


export const handle = sequence(authHandler);
