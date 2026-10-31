namespace Blog.Services;

public sealed record RenderedMarkdown(string Html, string ContentsHtml, string Text, bool HasCharts, bool HasFunctionCharts, bool HasMath)
{
    public string StylesHtml { get; init; } = "";
    public string Html { get; internal set; } = Html;
}