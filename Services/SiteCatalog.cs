using System.Collections.ObjectModel;
using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using Blog.Models;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace Blog.Services;

public sealed partial class SiteCatalog
{
    public const string Title = "Whatever crossed my mind";
    public const string Description = "Notes on software, algorithms, performance, and security by Ian Qvist.";
    public const string Origin = "https://genbox.github.io";
    public const string Author = "Ian Qvist";
    public const string AuthorUrl = "https://github.com/Genbox";
    public const int PageSize = 20;

    private static readonly IDeserializer Headers = new DeserializerBuilder()
                                                    .WithNamingConvention(UnderscoredNamingConvention.Instance)
                                                    .WithEnforceRequiredMembers().WithEnforceNullability().IgnoreUnmatchedProperties().Build();

    private readonly Dictionary<string, Post> postsByUrl;

    public SiteCatalog(IWebHostEnvironment environment, MarkdownRenderer renderer)
    {
        string root = environment.ContentRootPath;
        JsonSerializerOptions json = new JsonSerializerOptions(JsonSerializerDefaults.Web);

        T Load<T>(string name)
        {
            return JsonSerializer.Deserialize<T>(File.ReadAllText(Path.Combine(root, "_data", name + ".json")), json)!;
        }

        // Only published Markdown is discovered. Drafts never enter routing or any public data.
        (string File, Post Post)[] posts = Directory.EnumerateFiles(Path.Combine(root, "_posts"), "*.md").Select(file => (file, ReadPost(file, renderer))).ToArray();

        // URLs are compared without case: the dev server routes them that way, and output written on a
        // case-insensitive file system would let one post overwrite the other.
        foreach (IGrouping<string, (string File, Post Post)> duplicate in posts.GroupBy(item => item.Post.Url, StringComparer.OrdinalIgnoreCase).Where(group => group.Count() > 1))
        {
            throw new InvalidDataException($"Permalink {duplicate.Key} is used by {string.Join(", ", duplicate.Select(item => Path.GetFileName(item.File)))}.");
        }

        Posts = Array.AsReadOnly(posts.Select(item => item.Post).OrderByDescending(post => post.Date).ThenBy(post => post.Url, StringComparer.Ordinal).ToArray());
        postsByUrl = Posts.ToDictionary(post => post.Url, StringComparer.OrdinalIgnoreCase);

        Topics = Load<Topic[]>("topics");
        foreach (Topic topic in Topics)
        {
            topic.Count = PostsForTopic(topic.Name).Count();
        }

        Repositories = Load<Repository[]>("repos").Where(repo => !repo.IsArchived).ToArray();
        Dictionary<string, Repository> repos = Repositories.ToDictionary(repo => repo.Name);
        ProjectGroups = Load<ProjectSelection[]>("projects")
                        .Select(group => new ProjectGroup(group.Name, group.Repos.Where(repos.ContainsKey).Select(name => repos[name]).ToArray())).ToArray();
        PinnedRepositories = Repositories.Where(repo => repo.Pinned.HasValue).OrderBy(repo => repo.Pinned).ToArray();
        RecentProjects = ProjectGroups.SelectMany(group => group.Repos).OrderByDescending(repo => repo.PushedAt).Take(5).ToArray();
        Friends = Load<FriendGroup[]>("friends");
        Quotes = Load<Quote[]>("quotes");
        Series = Load<ArticleSeries[]>("series");

        foreach (ArticleSeries series in Series)
        {
            series.Articles = series.Parts.Select(FindPost).ToArray();
            series.OverviewPost = series.Overview is { } overview ? FindPost(overview) : null;
        }
    }

    public ReadOnlyCollection<Post> Posts { get; }
    public IReadOnlyList<Topic> Topics { get; }
    public IReadOnlyList<Repository> Repositories { get; }
    public IReadOnlyList<ProjectGroup> ProjectGroups { get; }
    public IReadOnlyList<Repository> PinnedRepositories { get; }
    public IReadOnlyList<Repository> RecentProjects { get; }
    public IReadOnlyList<FriendGroup> Friends { get; }
    public IReadOnlyList<Quote> Quotes { get; }
    public IReadOnlyList<ArticleSeries> Series { get; }
    public int ProjectCount => ProjectGroups.Sum(group => group.Repos.Count);
    public int PageCount => Math.Max(1, (Posts.Count + PageSize - 1) / PageSize);

    [GeneratedRegex(@"[^\p{L}\p{N}]+")]
    private static partial Regex SlugSeparatorRegex { get; }

    public Post? FindPost(string url)
    {
        return postsByUrl.GetValueOrDefault(url);
    }

    public Topic? FindTopic(string slug)
    {
        return Topics.FirstOrDefault(topic => topic.Slug == slug);
    }

    public IEnumerable<Post> PostsForTopic(string name)
    {
        return Posts.Where(post => post.Tags.Contains(name));
    }

    public ArticleSeries? SeriesFor(Post post)
    {
        return Series.FirstOrDefault(series => series.Parts.Contains(post.Url) || series.Overview == post.Url);
    }

    public static string PageUrl(int page)
    {
        return page == 1 ? "/" : $"/page/{page}/";
    }

    public static string Slug(string value)
    {
        return SlugSeparatorRegex.Replace(value.ToLowerInvariant(), "-").Trim('-');
    }

    public string TopicUrl(string name)
    {
        return Topics.FirstOrDefault(topic => topic.Name == name)?.Url ?? "/topics/";
    }

    private static Post ReadPost(string file, MarkdownRenderer renderer)
    {
        string source = File.ReadAllText(file).Replace("\r\n", "\n");
        int end = source.IndexOf("\n---\n", 3, StringComparison.Ordinal);
        if (!source.StartsWith("---\n", StringComparison.Ordinal) || end < 0)
            throw new InvalidDataException($"Missing YAML header in {file}.");
        PostHeader header = Headers.Deserialize<PostHeader>(source[4..end]);

        DateTimeOffset ParseDate(string value)
        {
            return DateTimeOffset.Parse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal);
        }

        return new Post(header.Title, header.Description, ParseDate(header.Date), header.LastModifiedAt is { } modified ? ParseDate(modified) : null, header.Permalink, header.Tags, renderer.Render(source[(end + 5)..]))
        {
            Stylesheets = header.Stylesheets
        };
    }
}