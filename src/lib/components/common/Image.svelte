<script lang="ts">
	import { dev } from '$app/environment';
	// import { i } from '../../../../build/_app/immutable/chunks/meta.CRspn0T0';

	export let src: string;
	export let alt: string;
	export let fullBleed: boolean | undefined = undefined;

	export let formats: string[] = ['avif', 'webp', 'png'];
	export let widths: string[] | undefined = undefined;

	$: fileName = src.split('.')[0];
	$: fileType = src.split('.')[1];

	function buildSrcset() {
		if (dev) return;

		let srcset = '';

		if (widths) {
			for (let i = 0; i < widths.length; i++) {
				srcset += `${fileName}-${widths[i]}.${formats[0]} ${widths[i]}w`;

				if (i < widths.length - 1) {
					srcset += ', ';
				}
			}
		} else {
			for (let i = 0; i < formats.length; i++) {
				srcset += `${fileName}.${formats[i]}`;

				if (i < formats.length - 1) {
					srcset += ', ';
				}
			}
		}

		if (fileType === "gif"){
			srcset = "";
		}
		return srcset;
	}
</script>

<img srcset={buildSrcset()} {src} {alt} loading="lazy" decoding="async" class:full-bleed={fullBleed} />

<style lang="scss">
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
