using Blog.Models;
using Blog.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Blog.Pages;

public sealed class PostModel(SiteCatalog site) : PageModel
{
    public Post Post { get; private set; } = null!;
    public Post? Previous { get; private set; }
    public Post? Next { get; private set; }
    public ArticleSeries? Series { get; private set; }

    public IActionResult OnGet()
    {
        Post? post = site.FindPost(Request.Path.Value!);
        if (post is null)
            return NotFound();
        Post = post;
        int index = site.Posts.IndexOf(post);
        Previous = site.Posts.ElementAtOrDefault(index + 1);
        Next = index > 0 ? site.Posts[index - 1] : null;
        Series = site.SeriesFor(post);
        ViewData["Post"] = post;
        ViewData["Title"] = post.Title;
        ViewData["Description"] = post.Description;
        ViewData["CanonicalPath"] = post.Url;
        List<string> styles = ["article.css"];
        if (post.Content.HasCharts)
            styles.Add("charts.css");
        styles.AddRange(post.Stylesheets);
        ViewData["Styles"] = styles.Distinct(StringComparer.Ordinal).ToArray();
        return Page();
    }
}