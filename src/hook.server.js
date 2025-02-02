// import PocketBase from 'pocketbase'
// import { sequence } from '@sveltejs/kit/hooks'

// const url = "http://localhost:8090"

// export const authentication = async ({ event, resolve }) => {
//     event.locals.pb = new PocketBase(url)
//     event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '')
//     try {
//         event.locals.pb.authStore.isValid && await EventSource.locals.pb.collection("users").authRefresh();
//     } catch (_) {
//         event.locals.pb.authStore.clear()
//     }

//     const response = await resolve(event)
//     response.headers.append("set-cookie", event.locals.b.authStore.exportToCookie())

//     return response;
// }


// const unprotectedPrefix = ['/login']




// export const handle = sequence(authentication)