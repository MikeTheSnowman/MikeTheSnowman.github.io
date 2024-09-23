<script lang="ts">
	import BlogPostCard from '$lib/components/common/BlogPostCard.svelte';
	import ContentSection from '$lib/components/home/ContentSection.svelte';
	import type { BlogPost } from '$lib/utils/types';
	import Button from '$lib/components/common/Button.svelte';

	export let posts: BlogPost[];
</script>

<ContentSection
	id="recent-posts"
	title="Blog posts"
	description="My 4 most recent blog posts are on the right, but for a full listing click below."
	align="left"
>
	<div slot="button">
		<Button href="/blog">View More</Button>
	</div>
	<div class="grid">
		{#each posts as post}
			<BlogPostCard
				slug={post.slug}
				title={post.title}
				excerpt={post.excerpt}
				tags={post.tags}
				readingTime={post.readingTime}
				showImage={false}
			/>
		{/each}
	</div>
</ContentSection>

<style lang="scss">
	@import '$lib/scss/breakpoints';

	.grid {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 20px;

		@include for-phone-only {
			grid-template-columns: 1fr;
		}
	}
</style>
