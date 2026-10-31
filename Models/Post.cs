using Blog.Services;

namespace Blog.Models;

public sealed record Post(string Title, string Description, DateTimeOffset Date, DateTimeOffset? Modified, string Url, string[] Tags, RenderedMarkdown Content)
{
    public string[] Stylesheets { get; init; } = [];

    public string SocialImage => "/assets/social/" + (Url.EndsWith(".html", StringComparison.Ordinal) ? Url[..^5] : Url).Trim('/').Replace('/', '-') + ".png";

    public int ReadingMinutes => Math.Max(1, Content.Text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length / 230);

    public bool ShowUpdated => Modified is { } modified && (modified - Date).TotalDays >= 8;
}