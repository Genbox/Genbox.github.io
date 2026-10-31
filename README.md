# Whatever crossed my mind

My blog at [genbox.github.io](https://genbox.github.io), built with ASP.NET Core Razor Pages and exported to static files with AspNetStatic.

## Development

Requires only the .NET 10 SDK; everything else comes from NuGet.

Run `dotnet run` to serve the site at http://localhost:4000. Restart after changing Markdown or JSON, as posts and data are loaded once at startup.

Generate the static site into `wwwroot` and exit:

```text
dotnet run --configuration Release --no-launch-profile -- --generate --urls http://127.0.0.1:4000
```

Generation clears `wwwroot`, processes assets and writes every page. AspNetStatic renders pages over HTTP, so generation briefly starts a local server. The build fails on a missing asset reference or a duplicate permalink.

Pushing to `main` runs the GitHub Actions workflow, which refreshes `_data/repos.json` from GitHub, generates the site and deploys it to GitHub Pages. Local builds use the committed `repos.json` unless `GH_TOKEN` is set.

## Writing posts

Create `_posts/YYYY-MM-DD-title.md` with a YAML header:

```yaml
---
title: "Optimizing C# Performance"
description: "Practical techniques for measuring and improving C# performance."
date: "2026-10-31T12:00:00Z"
permalink: "/2026/10/optimizing-csharp-performance.html"
tags: ["C#", "Performance"]
---
```

The permalink sets the URL, not the filename. Add `last_modified_at` to mark an update. Dates use ISO 8601 with an offset.

- Choose tags from `_data/topics.json`.
- Use `##` headings; two or more produce an "On this page" index.
- Define multipart articles in `_data/series.json` by permalink.
- Store post images in `assets/images/posts` and link to `/assets/images/posts/...`.
- Fenced code blocks take language names such as `csharp`, `cpp` and `json`.
- Markdig attributes work on images and links, e.g. `{width="640" height="480" loading="lazy"}`.
- `$...$` and `$$...$$` equations load MathJax automatically. Display equations get an "Equation" label; override it with `{aria-label="..."}`.
- Unfinished posts go in `_drafts`, which is Git-ignored and never published. Move a file to `_posts` to publish it.

### Shared stylesheets

Declare shared CSS files in the post's YAML header:

```yaml
stylesheets: ["diagrams.css", "vector-diagrams.css", "physics-diagrams.css"]
```

Names are relative to `assets/css`. Only that post loads the listed files, in declaration order,
after the standard article/chart styles and before any post-local CSS. Duplicate names are loaded
once. New shared stylesheets need no renderer changes or special markup classes.

`diagrams.css` provides `.diagram` for caption typography and responsive SVGs, plus
`.diagram-panel` for the common border, background, padding and margin. Add both classes to
panel figures and load this file before `vector-diagrams.css` or `physics-diagrams.css`.
Component styles and post-local CSS override the defaults for specialized layouts.

### CSS inside a post

Put a raw HTML `<style>` block after the YAML header or anywhere in the Markdown body:

```html
<style>
.prose .example-diagram {
    border: 1px solid var(--accent);
}
</style>

<div class="example-diagram">Diagram content</div>
```

The renderer moves these blocks into that post's page head, after the shared styles and before
print styles. They are not added to the site-wide CSS, search text, or reading-time calculation.
Multiple blocks retain their order and attributes, such as `media="print"`. Fenced examples
remain code examples. Selectors use ordinary CSS rules; use a specific class to target your
post's content.

## Charts

Charts are fenced YAML blocks:

````markdown
```chart
id: character-types
type: bars
title: Character types
data:
  - ["Lowercase letters", 65]
  - ["Digits", 31]
```
````

Types are `bars`, `columns`, `split` and `function`. Every chart includes a data table. `id` is optional.

Category charts support `unit` (default `%`), `decimals` (default `2`), `max`, `note`, `category_label`, `value_label` and `x_label`.

````markdown
```chart
id: sine-approximation
type: function
title: Sine approximation
x: ["-pi", "pi"]
x_ticks: pi
error: true
series:
  - name: Sine
    fn: sin
  - name: Approximation
    fn: poly
    coefficients: [0, 1, 0, -0.16666667, 0, 0.00833333]
```
````

Function types are `sin`, `poly` and `corrected_poly`. Coefficients are in ascending power order. Bounds and coefficients accept numbers or simple multiples and fractions of `pi`. Function charts show values on hover.

## Source structure

| Location             | Purpose                                                                         |
|----------------------|---------------------------------------------------------------------------------|
| `_posts`, `_drafts`  | Published and unpublished Markdown                                              |
| `_data`              | Topics, projects, friends, repositories, series, themes, quotes and image sizes |
| `Pages`              | Razor pages, layout and partials                                                |
| `Models`, `Services` | Data types, site catalog, Markdown and chart rendering                          |
| `Generation`         | Static export, asset pipeline, images, social cards, feed and search index      |
| `assets`             | Readable CSS, JavaScript, fonts, images and audio                               |
| `wwwroot`            | Generated output; never edit it                                                 |

## Image folders

Images in `assets/images` are grouped by purpose:

- `posts`: images referenced by published posts and drafts.
- `heroes`: homepage hero artwork and sprites.
- `themes`: seasonal decorations and theme artwork.
- `characters`: artwork for companion characters, such as the dog cursor.
- `404`: illustrations for the not-found page.

## Asset processing

- CSS and JavaScript are minified with NUglify.
- Every asset URL gets a `?v=` hash of its final bytes, including references inside CSS, Markdown and the list of on-demand easter-egg files.
- PNGs are recompressed losslessly.
- WebP images listed in `_data/images.json` are scaled down to twice their largest display size. Results are cached in `obj/images`.
- Social cards are drawn with PeachDrawing and cached in `obj/social-cards.json`.
- Favicons and the touch icon are published at the site root.

Sources in `assets` are never modified. Cloudflare analytics is configured in `appsettings.json` and skipped on localhost. Generated text files have no trailing newline.