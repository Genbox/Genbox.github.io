using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Blog.Models;
using Blog.Services;
using PeachDrawing;
using PeachDrawing.Core;
using PeachDrawing.Core.Geometry;
using PeachImage.Formats.Png;

namespace Blog.Generation;

/// <summary>Renders the site's social previews using managed font and image libraries.</summary>
public sealed class SocialCardGenerator(IWebHostEnvironment environment, SiteCatalog site)
{
    private const int Width = 1200;
    private const int Height = 630;
    private const int PadX = 72;
    private const int PadY = 64;
    private static readonly string Host = new Uri(SiteCatalog.Origin).Host;
    private static readonly PaintColor Background = PaintColor.FromArgb(13, 15, 18);
    private static readonly PaintColor Surface = PaintColor.FromArgb(22, 26, 31);
    private static readonly PaintColor Line = PaintColor.FromArgb(38, 43, 50);
    private static readonly PaintColor Accent = PaintColor.FromArgb(110, 231, 183);
    private static readonly PaintColor Heading = PaintColor.FromArgb(244, 245, 247);
    private static readonly PaintColor Text = PaintColor.FromArgb(231, 233, 236);
    private static readonly PaintColor Muted = PaintColor.FromArgb(143, 151, 162);

    public async Task GenerateAsync(string outputRoot, CancellationToken cancellationToken = default)
    {
        string sansFile = Path.Combine(environment.ContentRootPath, "assets", "fonts", "Geist-Variable.woff2");
        string monoFile = Path.Combine(environment.ContentRootPath, "assets", "fonts", "GeistMono-Variable.woff2");
        string directory = Path.Combine(outputRoot, "assets", "social");
        Directory.CreateDirectory(directory);

        // Rendering every card takes seconds, so the dev server keeps cards whose inputs are unchanged. The
        // deterministic build's module ID changes with the drawing code; the font stamps cover the fonts.
        string cacheFile = Path.Combine(environment.ContentRootPath, "obj", "social-cards.json");
        Dictionary<string, string> previous = [];
        if (File.Exists(cacheFile))
            previous = JsonSerializer.Deserialize<Dictionary<string, string>>(await File.ReadAllTextAsync(cacheFile, cancellationToken)) ?? [];
        Dictionary<string, string> current = new Dictionary<string, string>(StringComparer.Ordinal);
        string renderer = string.Join('|', typeof(SocialCardGenerator).Assembly.ManifestModule.ModuleVersionId, Stamp(sansFile), Stamp(monoFile));
        RasterRenderContext? context = null;

        async Task Render(string name, string inputs, Action<RasterRenderContext, RasterCanvas> draw)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (current.ContainsKey(name))
                throw new InvalidOperationException($"Two social cards would be written to {name}.");
            string key = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(renderer + "\n" + inputs)));
            current[name] = key;
            string file = Path.Combine(directory, name);
            if (File.Exists(file) && previous.GetValueOrDefault(name) == key)
                return;
            if (context is null)
            {
                context = new RasterRenderContext();
                await using (FileStream sans = File.OpenRead(sansFile))
                    await context.AddFont(sans, "Social Sans");
                await using (FileStream mono = File.OpenRead(monoFile))
                    await context.AddFont(mono, "Social Mono");
            }

            using (RasterCanvas canvas = BaseCard(context))
            {
                draw(context, canvas);
                await using FileStream output = File.Create(file);
                await canvas.SaveAsync(output, "png", new PngEncoderOptions(), cancellationToken);
            }

            await ImageOptimizer.OptimizeAsync(file, cancellationToken);
        }

        int since = site.Posts.Select(post => post.Date.Year).DefaultIfEmpty(DateTimeOffset.UtcNow.Year).Min();
        await Render("site.png", $"{site.Posts.Count}|{since}", (ctx, canvas) => SiteCard(ctx, canvas, since));
        foreach (Post post in site.Posts)
        {
            await Render(Path.GetFileName(post.SocialImage), $"{post.Title}|{post.Date:O}|{string.Join('|', post.Tags)}", (ctx, canvas) => PostCard(ctx, canvas, post));
        }

        foreach (string stale in Directory.EnumerateFiles(directory, "*.png"))
        {
            if (!current.ContainsKey(Path.GetFileName(stale)))
                File.Delete(stale);
        }

        Directory.CreateDirectory(Path.GetDirectoryName(cacheFile)!);
        await File.WriteAllTextAsync(cacheFile, JsonSerializer.Serialize(current), cancellationToken);
    }

    private static string Stamp(string file)
    {
        FileInfo info = new FileInfo(file);
        return info.Length + "@" + info.LastWriteTimeUtc.Ticks;
    }

    private static RasterCanvas BaseCard(RasterRenderContext context)
    {
        RasterCanvas canvas = context.CreateCanvas(Width, Height);
        canvas.DrawRectangle(canvas.GetSolidBrush(Background), 0, 0, Width, Height);
        canvas.DrawRectangle(canvas.GetSolidBrush(Accent), 0, 0, Width, 6);
        return canvas;
    }

    private static Font Font(RasterRenderContext context, bool mono, double size, double weight = 400)
    {
        return context.GetFont(mono ? "Social Mono" : "Social Sans", size, PaintFontStyle.Regular, weight)
               ?? throw new InvalidOperationException("The social-card font could not be loaded.");
    }

    private static double TextWidth(RasterCanvas canvas, string text, Font font, double tracking = 0)
    {
        return canvas.MeasureString(text, font).Width + tracking * font.Size * Math.Max(0, canvas.CountShapedGlyphs(text, font) - 1);
    }

    private static void DrawText(RasterCanvas canvas, string text, Font font, PaintColor color, double x, double y, double tracking = 0)
    {
        canvas.DrawString(text, font, color, new PaintPoint(x, y), new Size(Width, font.Height), tracking * font.Size);
    }

    private static List<string> Wrap(RasterCanvas canvas, string text, Font font, double maxWidth, double tracking)
    {
        List<string> lines = [];
        string line = "";
        foreach (string word in text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries))
        {
            string candidate = line.Length == 0 ? word : line + " " + word;
            if (line.Length > 0 && TextWidth(canvas, candidate, font, tracking) > maxWidth)
            {
                lines.Add(line);
                line = word;
            }
            else line = candidate;
        }

        if (line.Length > 0)
            lines.Add(line);
        return lines;
    }

    private static void RoundedRectangle(RasterCanvas canvas, double x, double y, double size, double radius, PaintColor color)
    {
        using GraphicsPath path = canvas.GetGraphicsPath();
        path.AddRoundedRectangle(new Rect(x, y, size, size), radius);
        canvas.DrawPath(canvas.GetSolidBrush(color), path);
    }

    private static void Icon(RasterRenderContext context, RasterCanvas canvas, double size)
    {
        RoundedRectangle(canvas, PadX, PadY, size, size * .23, Line);
        RoundedRectangle(canvas, PadX + 1, PadY + 1, size - 2, size * .23 - 1, Surface);
        Font font = Font(context, true, Math.Round(size * .4), 500);
        canvas.DrawStringInRect(">_", font, Accent, new Rect(PadX, PadY, size, size), BoxAlignment.Center, BoxAlignment.Center);
    }

    private static void Footer(RasterRenderContext context, RasterCanvas canvas, string left)
    {
        double y = Height - PadY - 30;
        canvas.DrawRectangle(canvas.GetSolidBrush(Line), PadX, y - 24, Width - 2 * PadX, 1);
        Font font = Font(context, true, 22);
        DrawText(canvas, left, font, Muted, PadX, y);
        DrawText(canvas, Host, font, Text, Width - PadX - TextWidth(canvas, Host, font), y);
    }

    private static void PostCard(RasterRenderContext context, RasterCanvas canvas, Post post)
    {
        Icon(context, canvas, 52);
        DrawText(canvas, SiteCatalog.Title, Font(context, false, 24, 600), Text, PadX + 68, PadY + 2);
        DrawText(canvas, "by " + SiteCatalog.Author, Font(context, false, 18), Muted, PadX + 68, PadY + 32);
        Font titleFont = Font(context, false, 76, 700);
        List<string> lines = [];
        foreach (int size in new[] { 76, 66, 58, 50 })
        {
            titleFont = Font(context, false, size, 700);
            lines = Wrap(canvas, post.Title, titleFont, Width - 2 * PadX, -.045);
            if (lines.Count <= 3)
                break;
        }

        double lineHeight = Math.Round(titleFont.Size * 1.04);
        double y = Height - PadY - 30 - 24 - 48 - lineHeight * lines.Count;
        if (post.Tags.Length > 0)
            DrawText(canvas, string.Join(" / ", post.Tags).ToUpperInvariant(), Font(context, true, 22), Accent, PadX, y - 54, .08);
        foreach (string line in lines)
        {
            DrawText(canvas, line, titleFont, Heading, PadX, y, -.045);
            y += lineHeight;
        }

        Footer(context, canvas, post.Date.ToString("MMMM d, yyyy", CultureInfo.InvariantCulture));
    }

    private void SiteCard(RasterRenderContext context, RasterCanvas canvas, int since)
    {
        Icon(context, canvas, 64);
        int size = 96;
        while (TextWidth(canvas, SiteCatalog.Title, Font(context, false, size, 700), -.05) > Width - 2 * PadX)
        {
            size -= 2;
        }

        double y = Height - PadY - 30 - 24 - 56 - size;
        DrawText(canvas, "// PERFORMANCE · SECURITY · DATA STRUCTURES · ALGORITHMS", Font(context, true, 22), Accent, PadX, y - 54, .08);
        DrawText(canvas, SiteCatalog.Title, Font(context, false, size, 700), Heading, PadX, y, -.05);
        Footer(context, canvas, $"{SiteCatalog.Author} · {site.Posts.Count} articles since {since}");
    }
}