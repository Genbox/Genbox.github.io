using System.Globalization;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using AngleSharp.Dom;
using AngleSharp.Html.Dom;
using AngleSharp.Html.Parser;
using ColorCode;
using ColorCode.Styling;
using Markdig;
using Markdig.Extensions.Mathematics;
using Markdig.Renderers;
using Markdig.Renderers.Html;
using Markdig.Syntax;

namespace Blog.Services;

public sealed partial class MarkdownRenderer(ChartRenderer charts)
{
    private static readonly MarkdownPipeline Pipeline = new MarkdownPipelineBuilder()
                                                        .UseAutoIdentifiers()
                                                        .UsePipeTables()
                                                        .UseEmphasisExtras()
                                                        .UseAutoLinks()
                                                        .UseFootnotes()
                                                        .UseMathematics()
                                                        .UseGenericAttributes()
                                                        .Build();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceSequenceRegex { get; }

    public RenderedMarkdown Render(string markdown)
    {
        MarkdownDocument document = Markdown.Parse(markdown, Pipeline);
        using StringWriter writer = new StringWriter(CultureInfo.InvariantCulture);
        HtmlRenderer renderer = new HtmlRenderer(writer);
        Pipeline.Setup(renderer);
        ArticleCodeRenderer codeRenderer = new ArticleCodeRenderer(charts);
        renderer.ObjectRenderers.Insert(0, codeRenderer);

        // MathBlock derives from CodeBlock: its renderer must precede the general code renderer.
        renderer.ObjectRenderers.Insert(0, new MathJaxBlockRenderer());
        renderer.ObjectRenderers.Insert(0, new MathJaxInlineRenderer());
        renderer.Render(document);
        writer.Flush();

        IHtmlDocument htmlDocument = new HtmlParser().ParseDocument(writer.ToString());
        IHtmlElement body = htmlDocument.Body!;

        // Leading styles may be parsed into the head; collect from the whole document.
        // Fenced examples are escaped text and are not style elements.
        IElement[] styles = htmlDocument.QuerySelectorAll("style").ToArray();
        string stylesHtml = string.Join("\n", styles.Select(style => style.OuterHtml));
        foreach (IElement style in styles)
            style.Remove();

        // Extract article text before adding heading numbers; code captions are excluded.
        string text = ExtractText(body);
        (string Id, string Label)[] sections = body.QuerySelectorAll("h2[id]").Select(heading => (Id: heading.Id!, Label: heading.TextContent)).ToArray();
        string contents = "";
        if (sections.Length >= 2)
        {
            contents = """<nav aria-label="On this page" class="toc"><span class="label">On this page</span><ol>"""
                       + string.Concat(sections.Select((section, i) => $"""<li><a href="#{H(section.Id)}"><span class="num">{i + 1:00}</span>{H(section.Label)}</a></li>"""))
                       + "</ol></nav>";
        }

        int headingIndex = 0;
        foreach (IElement heading in body.QuerySelectorAll("h2[id], h3[id]"))
        {
            string label = heading.TextContent;
            if (heading.LocalName == "h2")
            {
                headingIndex++;
                if (sections.Length >= 2)
                {
                    IElement number = htmlDocument.CreateElement("span");
                    number.ClassName = "num";
                    number.SetAttribute("aria-hidden", "true");
                    number.TextContent = headingIndex.ToString("00", CultureInfo.InvariantCulture);
                    heading.InsertBefore(number, heading.FirstChild);
                }
            }

            IElement link = htmlDocument.CreateElement("a");
            link.ClassName = "hash";
            link.SetAttribute("href", "#" + heading.Id);
            link.SetAttribute("aria-label", "Link to " + label);
            link.TextContent = "#";
            heading.AppendChild(link);
        }

        int tableIndex = 0;
        foreach (IElement table in body.QuerySelectorAll("table").ToArray())
        {
            foreach (IElement heading in table.QuerySelectorAll("th:not([scope])"))
            {
                heading.SetAttribute("scope", "col");
            }

            IElement wrapper = htmlDocument.CreateElement("div");
            wrapper.ClassName = "table-scroll";
            wrapper.SetAttribute("tabindex", "0");
            wrapper.SetAttribute("role", "region");
            wrapper.SetAttribute("aria-label", $"Table {++tableIndex}");
            table.Parent!.InsertBefore(wrapper, table);
            wrapper.AppendChild(table);
        }

        return new RenderedMarkdown(body.InnerHtml, contents, text, codeRenderer.Count > 0, codeRenderer.HasFunctionCharts, document.Descendants().Any(node => node is MathBlock or MathInline))
        {
            StylesHtml = stylesHtml
        };
    }

    private static string ExtractText(INode node)
    {
        StringBuilder text = new StringBuilder();

        void Visit(INode current)
        {
            if (current is IText leaf)
            {
                text.Append(leaf.Data);
                return;
            }

            if (current is IElement element && (element.LocalName is "script" or "style" or "svg" || element.ClassList.Contains("code-bar")))
                return;
            bool separated = current is IElement block && block.LocalName is "p" or "div" or "h1" or "h2" or "h3" or "h4" or "h5" or "h6" or "li" or "td" or "th" or "tr" or "br" or "pre" or "figcaption";
            if (separated)
                text.Append(' ');
            foreach (INode child in current.ChildNodes)
            {
                Visit(child);
            }

            if (separated)
                text.Append(' ');
        }

        Visit(node);
        return WhitespaceSequenceRegex.Replace(text.ToString(), " ").Trim();
    }

    private static StyleDictionary SyntaxStyles()
    {
        // ColorCode's DefaultLight getter creates a fresh dictionary and fresh Style instances.
        StyleDictionary styles = StyleDictionary.DefaultLight;

        // Reuse the site's existing Rouge CSS palette with ColorCode's parsed token scopes.
        foreach (Style style in styles)
        {
            string name = style.ReferenceName.ToLowerInvariant();
            style.ReferenceName = name switch
            {
                var value when value.Contains("comment", StringComparison.Ordinal) => "c1",
                var value when value.Contains("string", StringComparison.Ordinal) || value.Contains("attributevalue", StringComparison.Ordinal) => "s",
                var value when value.Contains("keyword", StringComparison.Ordinal) || value.Contains("const", StringComparison.Ordinal) => "k",
                var value when value.Contains("number", StringComparison.Ordinal) => "m",
                var value when value.Contains("class", StringComparison.Ordinal) || value.Contains("type", StringComparison.Ordinal) || value.Contains("elementname", StringComparison.Ordinal) => "nc",
                var value when value.Contains("attribute", StringComparison.Ordinal) || value.Contains("key", StringComparison.Ordinal) => "na",
                var value when value.Contains("operator", StringComparison.Ordinal) || value.Contains("delimiter", StringComparison.Ordinal) => "o",
                _ => "n"
            };
        }

        return styles;
    }

    private static (string Name, string? Color, string SyntaxId) Language(string language)
    {
        return language.ToLowerInvariant() switch
        {
            "cs" or "csharp" => ("C#", "#9B7CF2", "csharp"),
            "c" => ("C", "#7CB7FF", "cpp"),
            "cpp" => ("C++", "#7CB7FF", "cpp"),
            "bash" => ("Bash", "#6EE7B7", "bash"),
            "sh" or "shell" => ("Shell", "#6EE7B7", language),
            "powershell" => ("PowerShell", "#7CB7FF", "powershell"),
            "bat" => ("Batch", "#6EE7B7", "bat"),
            "js" or "javascript" => ("JavaScript", "#F2B84B", "javascript"),
            "json" => ("JSON", "#F2B84B", "json"),
            "xml" => ("XML", "#F78C6C", "xml"),
            "html" => ("HTML", "#F78C6C", "html"),
            "sql" => ("SQL", "#7CB7FF", "sql"),
            "python" => ("Python", "#F2B84B", "python"),
            "yaml" => ("YAML", "#F78C6C", "yaml"),
            "text" or "plaintext" or "" => ("Text", null, "text"),
            _ => (language, null, language)
        };
    }

    private static string H(string value)
    {
        return WebUtility.HtmlEncode(value);
    }

    private sealed class MathJaxBlockRenderer : HtmlObjectRenderer<MathBlock>
    {
        protected override void Write(HtmlRenderer renderer, MathBlock block)
        {
            HtmlAttributes attributes = block.GetAttributes();
            attributes.AddClass("equation");
            attributes.AddPropertyIfNotExist("tabindex", "0");
            attributes.AddPropertyIfNotExist("role", "region");
            attributes.AddPropertyIfNotExist("aria-label", "Equation");
            renderer.EnsureLine();
            renderer.Write("<div").WriteAttributes(block).WriteLine(">");
            renderer.WriteLine("\\[");
            renderer.WriteLeafRawLines(block, true, true);
            renderer.WriteLine("\\]</div>");
        }
    }

    private sealed class MathJaxInlineRenderer : HtmlObjectRenderer<MathInline>
    {
        protected override void Write(HtmlRenderer renderer, MathInline math)
        {
            bool display = math.DelimiterCount > 1;
            renderer.Write("<span").WriteAttributes(math).Write(">");
            renderer.Write(display ? "\\[" : "\\(");
            renderer.WriteEscape(math.Content.ToString());
            renderer.Write(display ? "\\]" : "\\)");
            renderer.Write("</span>");
        }
    }

    private sealed class ArticleCodeRenderer(ChartRenderer charts) : HtmlObjectRenderer<CodeBlock>
    {
        private readonly HtmlClassFormatter formatter = new HtmlClassFormatter(SyntaxStyles());
        private int codeIndex;
        public int Count { get; private set; }
        public bool HasFunctionCharts { get; private set; }

        protected override void Write(HtmlRenderer renderer, CodeBlock block)
        {
            renderer.EnsureLine();
            if (block is FencedCodeBlock { Info: "chart" })
            {
                RenderedChart chart = charts.Render(block.Lines.ToString(), ++Count);
                HasFunctionCharts |= chart.IsFunction;
                renderer.WriteLine(chart.Html);
                return;
            }

            string language = (block as FencedCodeBlock)?.Info ?? "text";
            (string name, string? color, string syntaxId) = Language(language);
            string source = block.Lines.ToString().Replace("\r\n", "\n") + (block.Lines.Count > 0 ? "\n" : "");
            ILanguage? syntax = Languages.FindById(syntaxId);
            string markup = H(source);
            if (syntax is not null)
            {
                // ColorCode wraps the highlighted fragment in <div><pre> and adds a newline
                // on either side. Extract its fragment without parsing another HTML document.
                string highlighted = formatter.GetHtmlString(source, syntax).Replace("\r\n", "\n");
                markup = highlighted[(highlighted.IndexOf("<pre>\n", StringComparison.Ordinal) + 6)..highlighted.LastIndexOf("\n</pre>", StringComparison.Ordinal)];
            }

            HtmlAttributes attributes = block.GetAttributes();
            if (block is FencedCodeBlock && language.Length > 0)
                attributes.AddClass("language-" + language);
            renderer.Write("<figure class=\"code\"");
            if (color is not null)
                renderer.Write($" style=\"--dot: {color}\"");
            renderer.Write($"""><figcaption class="code-bar"><span class="code-lang">{H(name)}</span></figcaption><div class="highlight"><pre tabindex="0" role="region" aria-label="{H(name)} code example {++codeIndex}"><code""");
            renderer.WriteAttributes(block).Write(">").Write(markup).WriteLine("</code></pre></div></figure>");
        }
    }
}