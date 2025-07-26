import { fail, redirect } from '@sveltejs/kit';
import { LogOut } from 'lucide-svelte';

export const actions = {
    register: async ({ locals, request }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');

        if (!email || !password) {
            return fail(400, { emailRequired: email === null, passwordRequired: password === null });
        }

        data.set('passwordConfirm', password?.toString())
        try {
            await locals.pb.collection('users').create(data);
            await locals.pb.collection('users').authWithPassword(email, password.toString());
            await locals.pb.collection('users').requestVerification(email);
        } catch (error) {
            const errorObj = error;
            return fail(500, { fail: true, message: errorObj.data.message });
        }

        throw redirect(303, '/profile');
    },
    
    login: async ({ locals, request }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');

        if (!email || !password) {
            return fail(400, { emailRequired: email === null, passwordRequired: password === null });
        }

        try {
            await locals.pb.collection('users').authWithPassword(email.toString(), password.toString());
        } catch (error) {
            const errorObj = error;
            return fail(500, { fail: true, message: errorObj.data.message });
        }

        throw redirect(303, '/');
    },
    
    logout: async ({ locals, request }) => {
        locals.pb.authStore.clear();
        throw redirect(303, '/')
    }

}