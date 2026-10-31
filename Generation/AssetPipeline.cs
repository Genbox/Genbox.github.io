using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Blog.Models;
using Blog.Services;
using NUglify;

namespace Blog.Generation;

/// <summary>Processes source assets before Razor renders any pages; hashes always describe final bytes.</summary>
public sealed partial class AssetPipeline(IWebHostEnvironment environment, IConfiguration configuration, SiteCatalog site)
{
    private const string Features = "/assets/js/shared/features.js";
    private const string ThemeBoot = "/assets/js/theme-boot.js";
    private static readonly UTF8Encoding Utf8 = new UTF8Encoding(false);
    private static readonly Uri Origin = new Uri(SiteCatalog.Origin);
    private readonly Dictionary<string, string> _files = new Dictionary<string, string>(StringComparer.Ordinal);
    private readonly HashSet<string> _processing = new HashSet<string>(StringComparer.Ordinal);
    private readonly Dictionary<string, string> _versions = new Dictionary<string, string>(StringComparer.Ordinal);
    public string ThemeBootstrap { get; private set; } = "";
    private string Root => environment.ContentRootPath;
    // WebRootPath is null when wwwroot did not exist at startup, as on a fresh checkout.
    private string Output => Path.Combine(Root, "wwwroot");

    // Quote backreferences are case-sensitive so the generator can emit a complete implementation.
    [GeneratedRegex("""(?<code><pre\b.*?</pre>|<code\b.*?</code>)|(?<prefix>\s(?:src|href|data-src|data-index|data-sprite|poster|content|url|srcset|data-srcset)\s*=\s*)(?<quote>["'])(?<value>.*?)(?-i:\k<quote>)""", RegexOptions.IgnoreCase | RegexOptions.Singleline, "en-US")]
    private static partial Regex HtmlAssetReferenceRegex { get; }

    [GeneratedRegex(@"(^\s*|,\s*)([^\s,]+)([^,]*)")]
    private static partial Regex SrcsetCandidateRegex { get; }

    [GeneratedRegex("""url\(\s*(["']?)([^)'"\s]+)(?-i:\1)\s*\)""", RegexOptions.IgnoreCase, "en-US")]
    private static partial Regex CssUrlRegex { get; }

    public async Task PrepareAsync(CancellationToken cancellationToken = default)
    {
        _files.Clear();
        _versions.Clear();
        _processing.Clear();

        Directory.CreateDirectory(Output);
        string source = Path.Combine(Root, "assets");
        string[] rootIcons = ["favicon.ico", "favicon.svg", "apple-touch-icon.png"];
        ImageResizer resizer = new ImageResizer(Root, JsonSerializer.Deserialize<Dictionary<string, ImageSize>>(await File.ReadAllTextAsync(Path.Combine(Root, "_data", "images.json"), cancellationToken), new JsonSerializerOptions(JsonSerializerDefaults.Web))!);

        foreach (string file in Directory.EnumerateFiles(source, "*", SearchOption.AllDirectories).Order())
        {
            string relative = Path.GetRelativePath(source, file).Replace('\\', '/');
            string route = rootIcons.Contains(relative) ? "/" + relative : "/assets/" + relative;
            string destination = Path.Combine(Output, route.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
            if (Path.GetExtension(file) is ".css" or ".js" or ".json" or ".svg" or ".txt")
            {
                string text = await File.ReadAllTextAsync(file, cancellationToken);
                if (route == "/assets/js/analytics.js")
                    text = text.Replace("\"__CLOUDFLARE_TOKEN__\"", JsonSerializer.Serialize(configuration["Site:CloudflareToken"] ?? ""), StringComparison.Ordinal);

                await File.WriteAllTextAsync(destination, text.TrimEnd('\r', '\n'), Utf8, cancellationToken);
            }
            else if (!await resizer.TryResizeAsync(relative, file, destination, cancellationToken))
            {
                File.Copy(file, destination, true);
                await ImageOptimizer.OptimizeAsync(destination, cancellationToken);
            }
        }

        await File.WriteAllTextAsync(Path.Combine(Output, "assets", "quotes.json"), JsonSerializer.Serialize(site.Quotes, new JsonSerializerOptions(JsonSerializerDefaults.Web)), Utf8, cancellationToken);
        await new SocialCardGenerator(environment, site).GenerateAsync(Output, cancellationToken);

        foreach (string file in Directory.EnumerateFiles(Path.Combine(Output, "assets"), "*", SearchOption.AllDirectories))
        {
            _files["/" + Path.GetRelativePath(Output, file).Replace('\\', '/')] = file;
        }

        foreach (string icon in rootIcons)
        {
            if (File.Exists(Path.Combine(Output, icon)))
                _files["/" + icon] = Path.Combine(Output, icon);
        }

        // Process ordinary code first. The feature registry and bootstrap depend on the resulting hashes.
        foreach ((string route, string file) in _files.OrderBy(pair => pair.Key))
        {
            if (route is Features or ThemeBoot)
                continue;

            if (Path.GetExtension(file) is ".css" or ".js")
                await File.WriteAllTextAsync(file, Minify(route, await File.ReadAllTextAsync(file, cancellationToken)), Utf8, cancellationToken);
        }

        Dictionary<string, ThemeDefinition> themes = JsonSerializer.Deserialize<Dictionary<string, ThemeDefinition>>(await File.ReadAllTextAsync(Path.Combine(Root, "_data", "themes.json"), cancellationToken), new JsonSerializerOptions(JsonSerializerDefaults.Web))!;

        var themeAssets = themes.ToDictionary(pair => pair.Key, pair => new
        {
            color = pair.Value.Color,
            style = Url($"/assets/js/themes/{pair.Value.Folder ?? pair.Key}/style.css")
        });

        string bootstrap = (await File.ReadAllTextAsync(_files[ThemeBoot], cancellationToken)).Replace("\"__THEME_ASSETS__\"", JsonSerializer.Serialize(themeAssets), StringComparison.Ordinal);
        ThemeBootstrap = Minify(ThemeBoot, bootstrap);
        await File.WriteAllTextAsync(_files[ThemeBoot], ThemeBootstrap, Utf8, cancellationToken);

        Dictionary<string, string> dynamicAssets = _files.Keys.Where(route => route != Features && (route.StartsWith("/assets/js/", StringComparison.Ordinal) || route.StartsWith("/assets/audio/", StringComparison.Ordinal) || route.StartsWith("/assets/images/404/", StringComparison.Ordinal) || route == "/assets/images/heroes/kaiju-walk-depth.webp"))
                                                         .Order().ToDictionary(route => route, Version);

        string features = (await File.ReadAllTextAsync(_files[Features], cancellationToken)).Replace("\"__ASSET_VERSIONS__\"", JsonSerializer.Serialize(dynamicAssets), StringComparison.Ordinal);
        await File.WriteAllTextAsync(_files[Features], Minify(Features, features), Utf8, cancellationToken);

        foreach (string route in _files.Keys)
        {
            Version(route);
        }

        foreach (Post post in site.Posts)
        {
            post.Content.Html = RewriteMarkup(post.Content.Html, post.Url);
        }
    }

    public string Url(string url, string owner = "/")
    {
        if (string.IsNullOrWhiteSpace(url) || url.StartsWith('#') || url.StartsWith("data:", StringComparison.OrdinalIgnoreCase) || !Uri.TryCreate(new Uri(Origin, owner), url, out Uri? absolute) || absolute.Scheme != Origin.Scheme || absolute.Authority != Origin.Authority)
            return url;

        // A missing asset is a typo or a stale reference; publishing it would only produce a broken page.
        if (!_files.ContainsKey(absolute.AbsolutePath))
        {
            if (absolute.AbsolutePath.StartsWith("/assets/", StringComparison.Ordinal))
                throw new InvalidOperationException($"{owner} references the missing asset {absolute.AbsolutePath}.");

            return url;
        }

        IEnumerable<string> query = absolute.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries)
                                            .Where(part => !part.StartsWith("v=", StringComparison.Ordinal)).Append("v=" + Version(absolute.AbsolutePath));

        string originalPath = url.Split('?', '#')[0];
        return originalPath + "?" + string.Join('&', query) + absolute.Fragment;
    }

    /// <summary>Versions Markdown asset references once, including lazy and responsive images.</summary>
    private string RewriteMarkup(string html, string owner = "/")
    {
        // Code samples are matched first and kept verbatim, so markup shown as text is never rewritten.
        return HtmlAssetReferenceRegex.Replace(html, match =>
        {
            if (match.Groups["code"].Success)
                return match.Value;
            string prefix = match.Groups["prefix"].Value;
            string value = WebUtility.HtmlDecode(match.Groups["value"].Value);
            string replacement;
            if (prefix.Contains("srcset", StringComparison.OrdinalIgnoreCase))
                replacement = SrcsetCandidateRegex.Replace(value, item => item.Groups[1].Value + Url(item.Groups[2].Value, owner) + item.Groups[3].Value);
            else
                replacement = Url(value, owner);

            string quote = match.Groups["quote"].Value;
            if (replacement == value)
                return match.Value;

            return prefix + quote + WebUtility.HtmlEncode(replacement) + quote;
        });
    }

    private string Version(string route)
    {
        if (_versions.TryGetValue(route, out string? hash))
            return hash;

        if (!_processing.Add(route))
            throw new InvalidOperationException($"Circular CSS asset reference: {route}");

        try
        {
            string file = _files[route];
            if (route.EndsWith(".css", StringComparison.Ordinal))
            {
                string css = CssUrlRegex.Replace(File.ReadAllText(file), match => "url(" + match.Groups[1].Value + Url(match.Groups[2].Value, route) + match.Groups[1].Value + ")");
                File.WriteAllText(file, css.TrimEnd('\r', '\n'), Utf8);
            }

            hash = Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(file))).ToLowerInvariant()[..16];
            _versions[route] = hash;
            return hash;
        }
        finally
        {
            _processing.Remove(route);
        }
    }

    private static string Minify(string route, string source)
    {
        UglifyResult result = route.EndsWith(".css", StringComparison.Ordinal) ? Uglify.Css(source) : Uglify.Js(source);

        if (result.HasErrors)
            throw new InvalidOperationException($"Minification failed for {route}: {string.Join("; ", result.Errors)}");

        return result.Code.TrimEnd('\r', '\n');
    }
}