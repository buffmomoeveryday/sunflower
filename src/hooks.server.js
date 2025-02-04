import PocketBase from 'pocketbase';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';

const url = 'http://localhost:8090';

export const authentication = async ({ event, resolve }) => {
    event.locals.pb = new PocketBase(url);
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
    try {
        if (event.locals.pb.authStore.isValid) {
            await event.locals.pb.collection('users').authRefresh();
        }
    } catch (_) {
        event.locals.pb.authStore.clear();
    }
    const response = await resolve(event);
    response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie());
    return response;
};


const protectedPrefix = ['/profile',];
export const authorization = async ({ event, resolve }) => {
    if (protectedPrefix.some((path) => event.url.pathname.startsWith(path))) {
        if (!event.locals.pb.authStore.isValid) {
            throw redirect(303, '/login');
        }
    }
    return await resolve(event);
};




export const handle = sequence(authentication, authorization);
