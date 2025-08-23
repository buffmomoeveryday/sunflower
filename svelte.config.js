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
		},
		experimental: {
			remoteFunctions: true
		},
	},
	vitePlugin: {
		inspector: true
	},

	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
