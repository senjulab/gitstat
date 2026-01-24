---
title: "Why We Built GitStat"
date: 2026-01-24
excerpt: "GitHub Insights is fine. But 14 days of traffic data and no star history wasn't cutting it. So we built something better with Bun, Next.js, Supabase, and the GitHub API."
---

## The Problem

If you maintain open source projects, you've probably clicked on the Insights tab more times than you'd like to admit.

And every time, you run into the same walls.

Traffic data? Gone after 14 days.

Star history? Just a number, no graph.

Want to see multiple repos at once? Open more tabs.

Need to export anything useful? Good luck.

GitHub Insights works. It's just not built for people who actually want to track their project's growth over time.


## What We Wanted

We wanted something simple.

See star growth over time, not just a count.

Keep traffic data longer than two weeks.

Compare multiple repos without browser tab chaos.

Export charts as images for READMEs and tweets.

Get actual CSV exports, not copy-paste from tables.

None of this should require an enterprise plan or a sales call.


## The Stack

We picked tools that let us move fast without dealing with configuration hell.


### Bun

Bun handles package management and runs our dev server.

Install times went from "go make coffee" to "already done."

Native TypeScript support means no transpilation step during development.

It just works.


### Next.js 16

We're on the App Router with React 19.

Server components handle the static stuff.

Client components handle the interactive charts and data fetching.

File-based routing means adding a new page is just creating a folder.

No webpack config. No babel plugins. The defaults are good enough.


### Supabase

Auth was the part we didn't want to build from scratch.

Supabase gives us GitHub OAuth out of the box.

Users sign in with their GitHub account, we get their access token, and we're done.

We use Postgres for storing which repos you've connected.

That's it. No complicated schema, no ORM gymnastics.


### GitHub API

Everything else comes straight from GitHub's REST API through Octokit.

Stars. Traffic. Contributors. Issues. PRs.

We fetch it all directly using your GitHub token.

This means no rate limit issues on our end. Your token, your limits.

And you're not trusting us with cached data that might be stale or wrong.


## Technical Decisions That Matter


### Client-Side Fetching

Most of the data fetching happens in your browser.

When you load the stars page, your browser hits GitHub's API directly with your token. We don't proxy it through our servers.

Why?

First, we don't hit GitHub's rate limits for you.

Second, your data never touches our infrastructure. We literally can't see your private repo stats because we never receive them.


### Batch Requests for Stars

Getting every stargazer for a popular repo means paginating through thousands of API calls.

We batch these 5 pages at a time with a progress indicator.

It's not instant, but you can see exactly how far along it is.


### Recharts for Visualization

The charts use Recharts.

It's React-native, handles responsive sizing well, and the area charts look clean.

We added hover states and custom tooltips to show exact values so you're not guessing at pixels.


### Export with html-to-image

When you click "Export PNG," we use html-to-image to capture the chart element directly.

No server rendering, no canvas manipulation.

The chart you see is the chart you get.


## What's Different from GitHub Insights

Star history: GitHub shows you a number. We show you a timeline of every stargazer with their avatar and when they starred.

Traffic retention: GitHub keeps 14 days. We fetch and display what's available, but we're working on historical storage.

Multi-repo view: GitHub makes you click between repos. We show all your connected repos in one sidebar.

Exports: GitHub has none. We have CSV for the data nerds and PNG for the social media posts.

Contributor stats: GitHub shows commit counts. We show lines added, lines deleted, and a leaderboard.


## Free, Actually

No trial periods.

No credit card required.

No "contact sales for more features."

The goal is to build something useful for developers who want to understand their GitHub projects better.

If you've ever wanted to know when exactly your repo hit 1,000 stars, or who your most active contributors are, or what your clone trends look like, that's what this is for.

We built GitStat because we needed it.

Hopefully you find it useful too.
