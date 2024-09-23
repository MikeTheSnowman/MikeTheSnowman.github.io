<script lang="ts">
    import Hero from '$lib/components/home/TitleArea.svelte';
    import About from '$lib/components/home/About.svelte';
    import RecentPosts from '$lib/components/home/RecentPosts.svelte';
    import type { Feature, BlogPost } from '$lib/utils/types';
    // import Features from '$lib/components/home/Features.svelte';

    export let data: {
        features: Feature[];
        posts: BlogPost[];
    };

    let { features, posts } = data;
</script>

<div class="container">
    <Hero />
    <About />
    {#if posts && posts.length > 0}
        <RecentPosts {posts} />
    {/if}

    <!--This component seems to have a bug that causes the page to crash.-->
    <!--    <Features {features} />-->
</div>
