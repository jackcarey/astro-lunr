# astro-lunr

Integration for building LunrJS index for Astro websites. Index items include text content underneath each heading tag.

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

### Index items

Each entry in `search_index.json` contains `loc`, `title`, and `content` properties.

*dist/some-path/index.html*
```
//...
<h2>Foo</h2>
<p>The text underneath the foo heading.</p>
<h2>Bar</h2>
<p>The text underneath the bar heading.</p>
//...
```

*search_index.json*
```
[
    {
        "loc": "/some-path#foo",
        "title": "Foo Heading",
        "content": "The text underneath the foo heading."
    },
    {
        "loc": "/some-path#bar",
        "title": "Bar Heading",
        "content": "The text underneath the bar heading."
    }
]
```

### Configuration

There are three functions you can pass to configure the index. Each function must return a boolean for whether or not it is included in the search index.

- **routeFilter** - A regular JavaScript array [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) that accepts [Astro RouteData](https://docs.astro.build/en/reference/integrations-reference/#routes-option) as input. 
- **resultFilter** - A regular JavaScript array [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) that accepts index items as input.
- **headingFilter** - Uses a [Cheerio filter](https://cheerio.js.org/classes/Cheerio.html#filter) against each heading tag.
- **contentFilter** - Uses a [Cheerio filter](https://cheerio.js.org/classes/Cheerio.html#filter) against the content below each heading.

### Client-side

This package doesn't provide a component yet, so use the [LunrJS documentation](https://lunrjs.com/guides/getting_started.html) to integrate a search input into your site.


