using AspNetStatic;
using AspNetStatic.Optimizer;
using Blog.Services;

namespace Blog.Generation;

public static class StaticSite
{
    public static IReadOnlyList<string> HtmlRoutes(SiteCatalog site)
    {
        return
        [
            "/", "/about/", "/projects/", "/friends/", "/topics/", "/search/", "/404.html",
            .. Enumerable.Range(2, site.PageCount - 1).Select(SiteCatalog.PageUrl),
            .. site.Topics.Select(topic => topic.Url),
            .. site.Posts.Select(post => post.Url)
        ];
    }

    public static string OutputFile(string route)
    {
        return route.EndsWith('/') ? route.TrimStart('/') + "index.html" : route.TrimStart('/');
    }

    public static IStaticResourcesInfoProvider Resources(SiteCatalog site)
    {
        return new StaticResourcesInfoProvider(HtmlRoutes(site).Concat(["/search.json", "/feed.xml", "/sitemap.xml", "/robots.txt"]).Select(route => new PageResource(route) { OutFile = OutputFile(route), OptimizationType = OptimizationType.None }));
    }

    public static void CleanOutput(IWebHostEnvironment environment)
    {
        // wwwroot is exclusively generated output. Never traverse outside it or through links.
        string root = Path.GetFullPath(Path.Combine(environment.ContentRootPath, "wwwroot"));
        Directory.CreateDirectory(root);
        if ((File.GetAttributes(root) & FileAttributes.ReparsePoint) != 0)
            throw new IOException("The generated output directory must not be a symbolic link.");
        EnumerationOptions options = new EnumerationOptions { RecurseSubdirectories = true, AttributesToSkip = FileAttributes.ReparsePoint };
        foreach (string file in Directory.EnumerateFiles(root, "*", options))
        {
            File.Delete(file);
        }

        // Deepest first, so a folder emptied by removing its children is removed as well. A folder holding a
        // skipped link is not empty and stays.
        foreach (string directory in Directory.EnumerateDirectories(root, "*", options).OrderByDescending(path => path.Length))
        {
            if (!Directory.EnumerateFileSystemEntries(directory).Any())
                Directory.Delete(directory);
        }
    }

    public static async Task<bool> ExportAsync(WebApplication app)
    {
        await app.StartAsync();
        try
        {
            string output = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
            bool generated = await app.GenerateStaticContentNow(output, dontUpdateLinks: true, dontOptimizeContent: true);
            IStaticResourcesInfoProvider resources = app.Services.GetRequiredService<IStaticResourcesInfoProvider>();
            string[] missing = resources.Resources.Where(resource => !File.Exists(Path.Combine(output, resource.OutFile!))).Select(resource => resource.Route).ToArray();
            if (!generated || missing.Length > 0)
            {
                app.Logger.LogError("Static generation failed. Missing outputs: {Routes}", string.Join(", ", missing));
                return false;
            }

            // Text output is kept consistent with the repository's no-final-newline convention.
            foreach (ResourceInfoBase resource in resources.Resources)
            {
                string file = Path.Combine(output, resource.OutFile!);
                string text = await File.ReadAllTextAsync(file);
                await File.WriteAllTextAsync(file, text.TrimEnd('\r', '\n'));
            }

            await File.WriteAllTextAsync(Path.Combine(output, ".nojekyll"), "");
            return true;
        }
        finally
        {
            await app.StopAsync();
        }
    }
}