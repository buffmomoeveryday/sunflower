export async function load({ locals }) {
	const user = locals.pb.authStore.baseModel;
	return {
		user
	};
}
