using System.Security;
using Blog.Models;
using Blog.Services;

namespace Blog.Generation;

/// <summary>The routes that are not HTML pages: the feed, sitemap, robots file and search index.</summary>
public static class SiteFiles
{
    public static void MapSiteFiles(this WebApplication app)
    {
        app.MapGet("/feed.xml", (SiteCatalog site) => Results.Text(Feed(site), "application/atom+xml; charset=utf-8"));
        app.MapGet("/sitemap.xml", (SiteCatalog site) => Results.Text(Sitemap(site), "application/xml; charset=utf-8"));
        app.MapGet("/robots.txt", () => Results.Text("User-agent: *\nAllow: /\nSitemap: " + SiteCatalog.Origin + "/sitemap.xml", "text/plain; charset=utf-8"));

        // Compact rows; search.js names the fields.
        app.MapGet("/search.json", (SiteCatalog site) => Results.Json(site.Posts.Select(post => new object[]
        {
            post.Title, post.Url, post.Date.ToString("yyyy-MM-dd"), post.Tags, post.Description, post.Content.Text
        })));
    }

    private static string Feed(SiteCatalog site)
    {
        string entries = string.Join("\n", site.Posts.Take(20).Select(post =>
        {
            string url = SecurityElement.Escape(SiteCatalog.Origin + post.Url);
            string categories = string.Join("\n", post.Tags.Select(tag => $"""<category term="{SecurityElement.Escape(tag)}" />"""));
            return $"""
                    <entry>
                        <title>{SecurityElement.Escape(post.Title)}</title>
                        <id>{url}</id>
                        <link href="{url}" />
                        <published>{post.Date:O}</published>
                        <updated>{post.Modified ?? post.Date:O}</updated>
                        <summary>{SecurityElement.Escape(post.Description)}</summary>
                        {categories}
                        <content type="html" xml:base="{url}">{SecurityElement.Escape(post.Content.Html)}</content>
                    </entry>
                    """;
        }));

        return $"""
                <feed xmlns="http://www.w3.org/2005/Atom">
                    <title>{SecurityElement.Escape(SiteCatalog.Title)}</title>
                    <subtitle>{SecurityElement.Escape(SiteCatalog.Description)}</subtitle>
                    <id>{SecurityElement.Escape(SiteCatalog.Origin)}/</id>
                    <link href="{SecurityElement.Escape(SiteCatalog.Origin)}/" />
                    <link href="{SecurityElement.Escape(SiteCatalog.Origin)}/feed.xml" rel="self" />
                    <updated>{site.Posts.Select(post => post.Modified ?? post.Date).DefaultIfEmpty(DateTimeOffset.UtcNow).Max():O}</updated>
                    <author>
                        <name>{SecurityElement.Escape(SiteCatalog.Author)}</name>
                        <uri>{SecurityElement.Escape(SiteCatalog.AuthorUrl)}</uri>
                    </author>
                    {entries}
                </feed>
                """;
    }

    private static string Sitemap(SiteCatalog site)
    {
        string urls = string.Join("\n", StaticSite.HtmlRoutes(site).Where(route => route != "/404.html").Select(route =>
        {
            Post? post = site.FindPost(route);
            string lastModified = post is null ? "" : $"""<lastmod>{post.Modified ?? post.Date:yyyy-MM-dd}</lastmod>""";
            return $"""
                    <url>
                        <loc>{SecurityElement.Escape(SiteCatalog.Origin + route)}</loc>
                        {lastModified}
                    </url>
                    """;
        }));

        return $"""
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                    {urls}
                </urlset>
                """;
    }
}