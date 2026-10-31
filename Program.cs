using System.Globalization;
using AspNetStatic;
using Blog.Generation;
using Blog.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.FileProviders;

bool generate = args.Contains("--generate", StringComparer.Ordinal);
WebApplicationBuilder builder = WebApplication.CreateBuilder(args.Where(arg => arg != "--generate").ToArray());
CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

// Generation requests every page; only warnings and failures are worth reading in the build log.
if (generate)
    builder.Logging.SetMinimumLevel(LogLevel.Warning);

// This stateless site needs no persisted cookie or antiforgery keys between runs.
builder.Services.AddDataProtection().UseEphemeralDataProtectionProvider();
builder.Services.AddSingleton<ChartRenderer>();
builder.Services.AddSingleton<MarkdownRenderer>();
builder.Services.AddSingleton<SiteCatalog>();
builder.Services.AddSingleton<AssetPipeline>();
builder.Services.AddRazorPages(options => options.Conventions.AddPageRoute("/Index", "page/{number:int}/"));
builder.Services.AddOptions<RazorPagesOptions>().Configure<SiteCatalog>((options, site) => options.Conventions.Add(new PostRoutes(site)));
builder.Services.AddSingleton<IStaticResourcesInfoProvider>(services => StaticSite.Resources(services.GetRequiredService<SiteCatalog>()));

WebApplication app = builder.Build();
if (generate)
{
    if (Environment.GetEnvironmentVariable("GH_TOKEN") is { Length: > 0 } token)
        await RepositoryUpdater.RefreshAsync(app.Environment.ContentRootPath, token, Environment.GetEnvironmentVariable("GITHUB_REPOSITORY_OWNER") ?? "Genbox", app.Logger);

    StaticSite.CleanOutput(app.Environment);
}

AssetPipeline assets = app.Services.GetRequiredService<AssetPipeline>();
await assets.PrepareAsync();
app.UseRouting();

// Endpoint-aware middleware serves only assets when a Razor route matches. Files generated
// after startup are visible through the physical provider; no build-time manifest is needed.
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "wwwroot"))
});
app.MapRazorPages();
app.MapSiteFiles();

if (generate)
{
    Environment.ExitCode = await StaticSite.ExportAsync(app) ? 0 : 1;
    await app.DisposeAsync();
}
else
    await app.RunAsync();