# astro-lunr

Components for enabling LunrJS for Astro websites.

- [Astro](https://astro.build/)
- [Lunr](https://lunrjs.com/)

## Prerequisites

Your Astro site should be set up and there should be no existing file at `/search_index.json` as it will be overwritten.

## Install

You must [enable experimental integrations](https://docs.astro.build/en/guides/integrations-guide/#finding-more-integrations) to use third-party integrations with Astro. After doing this, you can install this integration like any other:

```
npx astro add @jackcarey/astro-lunr
```
or
```
npm i @jackcarey/astro-lunr
```
## Usage

Each entry in `search_index.json` contains `loc`, `title`, and `content` properties.

This package doesn't provide a component yet, so use the[LunrJS documentation](https://lunrjs.com/guides/getting_started.html) to integrate a search into your site.


