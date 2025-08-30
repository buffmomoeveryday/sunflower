import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ locals, request }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const password2 = formData.get('password2');
		if (!email || !password || password !== password2) {
			return fail(400, {
				emailRequired: !email,
				passwordRequired: !password,
				passwordMatch: password !== password2
			});
		}

		const data = {
			password,
			passwordConfirm: password2,
			email,
			emailVisibility: true,
			name: email.split('@')[0]
		};

		try {
			const user = await locals.pb.collection('users').create(data);
			throw redirect(303, '/login');
		} catch (error) {
			console.error(error);
			return fail(500, { fail: true, message: error.data?.message || 'An error occurred' });
		}
	}
};
