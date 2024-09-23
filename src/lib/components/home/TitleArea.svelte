<script>
	import GitHubIcon from '$lib/icons/socials/github.svelte';
	import LinkedInIcon from '$lib/icons/socials/linkedin.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import Sparkles from '../common/Sparkles.svelte';
</script>

<section id="hero">
	<h1 class="hello">I Just Push Buttons Professionally</h1>
	<p class="intro">
		<span class="left">Come to share knowledge,</span>
		<span class="right">stay for the dumplings.</span>
	</p>
	<div class="ctas">
		<Sparkles>
			<Button href="https://github.com/MikeTheSnowman">
				<GitHubIcon slot="icon" />
				My Projects
			</Button>
		</Sparkles>
		<Button color="primary" href="https://www.linkedin.com/in/michael-snowden-0332538/">
			<LinkedInIcon slot="icon" />
			LinkedIn
		</Button>
	</div>
</section>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	#hero {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 15px;
		position: relative;
		padding: 80px 0;

		@include for-phone-only {
			padding: 40px 0 50px;
		}

		.hello {
			text-align: center;
		}

		.intro {
			font-weight: 500;
			font-size: 1.4rem;
			width: min(100%, 440px);
			display: flex;
			flex-direction: column;

			.left {
				text-align: left;
			}
			.right {
				text-align: right;
			}

			@include for-phone-only {
				display: none;
			}
		}

		.ctas {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
			gap: 10px;
			width: 100%;
		}
	}
</style>
