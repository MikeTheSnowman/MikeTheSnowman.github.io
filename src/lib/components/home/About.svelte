<script>
	import SparklingHighlight from '$lib/components/common/SparklingHighlight.svelte';
</script>

<section id="about">
	<div class="info">
		<h2>
			Hey, my name is Mike.<br>
			I like <SparklingHighlight color="secondary">tech</SparklingHighlight> and <SparklingHighlight color="secondary">tinkering</SparklingHighlight>.
		</h2>
		<p>
			I've been working in the AppSec space for the better part of 10 years, but I've had the good fortune to dabble in a long list of other things including, but not limited to: electronics, 3D modeling, game design/development, 3D printing, electronics, rock climbing, MMA, manufacturing, biology, enterprise app development, (I hate to admit it) AI app development, reverse engineering, and a few other things.
			<br>
			I'm hoping that in this little corner of the web, I can (not loose the motivation to) share some of the things I've learned over the years. Hopefully, there are others out there who find these topics interesting as well, and who knows... Maybe it'll help someone with their own projects.
			<br>
			I generally don't bite, so feel free to ping me on LinkedIn.
		</p>
	</div>
	<div>
		<img
				class="image"
				src="/images/LinkedIn-Profile-Pic.jpg"
				alt="My mom tells me that I look handsome... Some times..."
		/>
	</div>
</section>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	#about {
		position: relative;
		display: grid;
		grid-template-columns: 500px 250px;
		align-items: center;
		justify-content: space-around;
		padding-bottom: 50px;

		@include for-phone-only {
			grid-template-columns: 1fr;
			justify-items: center;
			gap: 20px;
		}

		.info {
			display: flex;
			flex-direction: column;
			gap: 10px;
			h2 {
				@include for-phone-only {
					text-align: center;
				}
			}

			p {
				@include for-phone-only {
					text-align: justify;
				}
			}

			@include for-phone-only {
				gap: 20px;
			}
		}

		.socials {
			display: flex;
			align-items: center;
			gap: 15px;

			@include for-phone-only {
				justify-content: center;
				margin-bottom: 10px;
				span {
					display: none;
				}
			}
		}

		.image {
			display: block;
			max-width: 250px;
			max-height: 250px;
			width: auto;
			height: auto;
			border-radius: 25%;
		}
	}
</style>
