import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const extensions = ['.svelte', '.md'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: '404.html',
			strict: true,
			pages: 'build',
			assets: 'build',
			precompress: false
		}),
		prerender: {
			handleHttpError: 'warn'
		},
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		}
	},
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: extensions,
			rehypePlugins: [
				rehypeExternalLinks, // Adds 'target' and 'rel' to external links
				rehypeSlug, // Adds 'id' attributes to Headings (h1,h2,etc)
				[
					rehypeAutolinkHeadings,
					{
						// Adds hyperlinks to the headings, requires rehypeSlug
						behavior: 'prepend',
						properties: { className: ['heading-link'], title: 'Permalink', ariaHidden: 'true' },
						content: {
							type: 'element',
							tagName: 'span',
							properties: {},
							children: [{ type: 'text', value: '#' }]
						}
					}
				]
			]
		})
	],
	onwarn: (warning, handler) =>{
		if (warning.code.startsWith('a11y-') || warning.code.startsWith('css-unused-selector')) {
			return;
		}
		handler(warning);
	},
	extensions: extensions
};

export default config;