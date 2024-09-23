# My little corner of the web
This repo hosts my personal blog, which is available at [https://mikethesnowman.github.io](https://mikethesnowman.github.io).

## What will you find in this "blog"?
Probably a lot of posts that are poorly written. In general, this blog is meant to be a tool for me to keep track of the
things that I've learned over the years. By making it publicly available, I'm hoping that I'm able to share something 
that's, even just a little, useful to someone out there in this ever shrinking world of ours.

## How was this blog created?

This blog is hosted and served using [_GitHub Pages_](https://docs.github.com/en/pages).
Typically GitHub Pages are use Jekyll, because that's what GH Pages natively supports, but I'm instead using 
[SvelteKit]([GH Pages Documentation](https://docs.github.com/en/pages)) with the static site generation adapter to create a statically generated site.
I have a GitHub Action Workflow that triggers on commits to the master branch of this repo, which handles compiling and
deploying this blog.

## Wow! Everything looks so pretty!
I'm happy you think so! I didn't develop any of the code. The code for this blog was a template that was created by 
an awesome guy called Matt Fantinel. I'm just using his template and the only thing I've really done is update the 
original packages in addition to make some other minor updates. The template's original code is available
at [https://github.com/matfantinel/sveltekit-static-blog-template](https://github.com/matfantinel/sveltekit-static-blog-template).

## How can I play with the code for your blog?
What a time to be alive. 
Assuming that you already have NodeJS v20.x (or newer), you can easily do this by running the following commands:
```bash
git clone https://github.com/MikeTheSnowman/MikeTheSnowman.github.io
cd MikeTheSnowman.github.io
npm install
npm run dev
```