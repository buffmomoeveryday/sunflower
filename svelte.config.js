import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			},
			environment: 'nodejs22.x'
		}),
		csrf: {
			checkOrigin: false
		},
		alias: {
			'@/*': './path/to/lib/*'
		}
	},
	vitePlugin: {
		inspector: true
	}
};

export default config;
