---
slug: vitess-getting-started
title: Learning Vitess - Getting started
date: 2024-09-29T01:00:00.000Z
excerpt: My little journey learning how to get started with Vitess and sharding
coverImage: /images/posts/learning-vitess/learning-vitess.jpg
tags:
  - Guide
---

Recently at work, I've been tasked with trying to resolve a very specific issue that one of my customer's is having with
my company's product. Not getting in to too much detail, we've got this web app, and it uses MySQL as its DB. 
Unfortunately, the DB has grown to being over a terabyte in size and this has caused the UI for the web app to start
feeling sluggish because of the extended time it's taking for queries to execute in MySQL.

There are probably a number of ways to address this issue, like setting up read-only replicas, indexing, and probably 
other more sensible things. But I wanted to try exploring sharding. Why would I do that when other, more reasonable and
lower effort, options available? ... Well, there are a lot of reasons:
- The biggest reason is because, I want to.
- I've never tried doing database sharding, so it'll be a good learning exercise.
- If Vitess is good enough for Youtube, then surely it's good enough for me... Right?

(More to be added later)