using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using YamlDotNet.RepresentationModel;

namespace Blog.Services;

/// <summary>Renders the YAML inside a Markdown chart fence into accessible, static chart markup.</summary>
public sealed partial class ChartRenderer
{
    private const int Samples = 241;
    private static readonly CultureInfo Invariant = CultureInfo.InvariantCulture;

    [GeneratedRegex(@"^(?<sign>-?)(?<factor>\d*\.?\d*)\s*\*?\s*(?<pi>pi)?\s*(?:/\s*(?<divisor>\d*\.?\d+))?$")]
    private static partial Regex ChartNumberExpressionRegex { get; }

    public RenderedChart Render(string yaml, int index)
    {
        YamlStream stream = new YamlStream();
        stream.Load(new StringReader(yaml));
        YamlMappingNode chart = (YamlMappingNode)stream.Documents[0].RootNode;
        string type = Value(chart, "type");
        string id = "chart-" + Value(chart, "id", "inline-" + index);
        string title = Value(chart, "title");
        string note = Value(chart, "note");
        string body = type switch
        {
            "columns" or "bars" or "split" => RenderCategories(chart, type),
            "function" => RenderFunction(chart),
            _ => throw new InvalidDataException($"Unknown chart type '{type}'.")
        };
        string figure = RenderFigure(id, type, title, note, body);
        return new RenderedChart(figure, type == "function");
    }

    private static string RenderFigure(string id, string type, string title, string note, string body)
    {
        string caption = RenderCaption(id, title, note);
        string label;
        if (title.Length > 0)
            label = $"aria-labelledby=\"{H(id)}-title\"";
        else if (note.Length > 0)
            label = $"aria-labelledby=\"{H(id)}-note\"";
        else
            label = $"aria-label=\"{H(type)} chart\"";

        return $"""<figure id="{H(id)}" class="chart chart-{type}" {label}><figcaption class="chart-head">{caption}</figcaption>{body}</figure>""";
    }

    private static string RenderCaption(string id, string title, string note)
    {
        string caption = "";
        if (title.Length > 0)
            caption += $"""<span class="chart-title" id="{H(id)}-title">{H(title)}</span>""";
        if (note.Length > 0)
            caption += $"""<span class="chart-note" id="{H(id)}-note">{H(note)}</span>""";
        return caption;
    }

    private static string RenderCategories(YamlMappingNode chart, string type)
    {
        (string Label, double Value)[] data = Sequence(chart, "data").Select(row => (YamlSequenceNode)row)
                                                                     .Select(row => (Label: row.Children[0].ToString(), Value: Number(row.Children[1].ToString()))).ToArray();
        int decimals = int.Parse(Value(chart, "decimals", "2"), Invariant);
        string unit = Value(chart, "unit", "%");

        string Format(double value)
        {
            return value.ToString("F" + decimals, Invariant) + unit;
        }

        double max = Has(chart, "max") ? Number(Value(chart, "max")) : data.Max(row => row.Value);

        string body = type switch
        {
            "columns" => RenderColumns(data, max, Format),
            "bars" => RenderBars(data, max, Format),
            _ => RenderSegments(data, Format)
        };
        if (type == "columns" && Has(chart, "x_label"))
            body += $"""<p class="chart-axis-label">{H(Value(chart, "x_label"))}</p>""";

        string categoryLabel = Value(chart, type == "columns" ? "x_label" : "category_label", "Category");
        string valueLabel = Value(chart, "value_label", "Share");
        return body + RenderTable([categoryLabel, valueLabel], data.Select(row => new[] { row.Label, Format(row.Value) }));
    }

    private static string RenderColumns((string Label, double Value)[] data, double max, Func<double, string> format)
    {
        StringBuilder items = new StringBuilder();
        foreach ((string Label, double Value) row in data)
        {
            string label = H(row.Label);
            string value = H(format(row.Value));
            string width = Width(row.Value, max);
            items.Append($"""<li title="{label}: {value}"><span class="chart-colbox"><span class="chart-value">{value}</span><span class="chart-col" style="--v: {width}%"></span></span><span class="chart-label">{label}</span></li>""");
        }

        return $"""<ol class="chart-cols">{items}</ol>""";
    }

    private static string RenderBars((string Label, double Value)[] data, double max, Func<double, string> format)
    {
        StringBuilder items = new StringBuilder();
        foreach ((string Label, double Value) row in data)
        {
            string label = H(row.Label);
            string value = H(format(row.Value));
            string width = Width(row.Value, max);
            items.Append($"""<li title="{label}: {value}"><span class="chart-label">{label}</span><span class="chart-track"><span class="chart-bar" style="--v: {width}%"></span></span><span class="chart-value">{value}</span></li>""");
        }

        return $"""<ol class="chart-rows">{items}</ol>""";
    }

    private static string RenderSegments((string Label, double Value)[] data, Func<double, string> format)
    {
        double total = data.Sum(row => row.Value);
        StringBuilder segments = new StringBuilder();
        StringBuilder keys = new StringBuilder();
        for (int i = 0; i < data.Length; i++)
        {
            string label = H(data[i].Label);
            string value = H(format(data[i].Value));
            string width = Width(data[i].Value, total);
            segments.Append($"""<span class="chart-part chart-part-{i}" style="--v: {width}%" title="{label}: {value}"></span>""");
            keys.Append($"""<li><span class="chart-key chart-part-{i}" aria-hidden="true"></span>{label} <span class="chart-value">{value}</span></li>""");
        }

        return $"""<div class="chart-segments">{segments}</div><ul class="chart-keys">{keys}</ul>""";
    }

    private static string Width(double value, double scale)
    {
        return N(scale == 0 ? 0 : value * 100 / scale);
    }

    private static string RenderFunction(YamlMappingNode chart)
    {
        double[] domain = Sequence(chart, "x").Select(node => Number(node.ToString())).ToArray();
        double[] xs = Enumerable.Range(0, Samples).Select(i => domain[0] + (domain[1] - domain[0]) * i / (Samples - 1)).ToArray();
        (string Name, double[] Values)[] series = SampleSeries(chart, xs);
        double[]? error = null;
        if (bool.TryParse(Value(chart, "error"), out bool showError) && showError && series.Length == 2)
            error = series[1].Values.Zip(series[0].Values, (a, b) => a - b).ToArray();
        (double Low, double High) range = NiceRange(series.SelectMany(item => item.Values));
        bool pi = Value(chart, "x_ticks") == "pi";
        (double Value, string Label)[] ticks = FunctionTicks(domain, pi);

        string legend = RenderLegend(series);
        string plots = RenderPlot(series.Select((item, i) => (item.Values, Class: "chart-series-" + i)).ToArray(), xs, range, 560, ticks);
        if (error != null)
        {
            double limit = error.Max(value => Math.Abs(value));
            plots += $"""<p class="chart-subtitle">Error: {H(series[1].Name)} − {H(series[0].Name)}</p>"""
                     + RenderPlot([(error, "chart-series-1")], xs, NiceRange([-limit, limit]), 200, ticks);
        }

        string payload = FunctionPayload(xs, series, error);
        string description = H(Value(chart, "description", Value(chart, "title", "Function chart")));
        string table = RenderFunctionTable(xs, series, error, pi);
        return $"""{legend}<div class="chart-plots" data-plot="{H(payload)}" role="img" aria-label="{description}">{plots}</div>{table}""";
    }

    private static (string Name, double[] Values)[] SampleSeries(YamlMappingNode chart, double[] xs)
    {
        return Sequence(chart, "series").Cast<YamlMappingNode>().Select(item =>
        {
            double[] coefficients = Sequence(item, "coefficients").Select(node => Number(node.ToString())).ToArray();

            double Evaluate(double x)
            {
                double polynomial = coefficients.Select((coefficient, i) => coefficient * Math.Pow(x, i)).Sum();
                return Value(item, "fn") switch
                {
                    "sin" => Math.Sin(x),
                    "poly" => polynomial,
                    "corrected_poly" => .225 * (polynomial * polynomial - polynomial) + polynomial,
                    var fn => throw new InvalidDataException($"Unknown chart function '{fn}'.")
                };
            }

            return (Name: Value(item, "name"), Values: xs.Select(Evaluate).ToArray());
        }).ToArray();
    }

    private static (double Value, string Label)[] FunctionTicks(double[] domain, bool pi)
    {
        (double Value, string Label)[] ticks;
        if (pi)
        {
            int firstTick = (int)Math.Ceiling(domain[0] / (Math.PI / 2));
            int lastTick = (int)Math.Floor(domain[1] / (Math.PI / 2));
            ticks = Enumerable.Range(firstTick, lastTick - firstTick + 1).Select(k => (Value: k * Math.PI / 2, Label: PiLabel(k, 2))).ToArray();
        }
        else
            ticks = Ticks(domain[0], domain[1]).Select(value => (Value: value, Label: TickNumber(value))).ToArray();
        return ticks;
    }

    private static string RenderLegend((string Name, double[] Values)[] series)
    {
        StringBuilder items = new StringBuilder();
        for (int i = 0; i < series.Length; i++)
        {
            items.Append($"""<li><span class="chart-swatch chart-series-{i}" aria-hidden="true"></span>{H(series[i].Name)}</li>""");
        }

        return $"""<ul class="chart-legend">{items}</ul>""";
    }

    private static string FunctionPayload(double[] xs, (string Name, double[] Values)[] series, double[]? error)
    {
        Dictionary<string, object> payload = new Dictionary<string, object>
        {
            ["x"] = xs.Select(value => Math.Round(value, 5)).ToArray(),
            ["series"] = series.Select(item => new { name = item.Name, y = item.Values.Select(value => Math.Round(value, 5)).ToArray() }).ToArray()
        };
        if (error != null)
            payload["error"] = error.Select(value => Math.Round(value, 5)).ToArray();
        return JsonSerializer.Serialize(payload);
    }

    private static string RenderFunctionTable(double[] xs, (string Name, double[] Values)[] series, double[]? error, bool pi)
    {
        IEnumerable<string> headers = new[] { "x" }.Concat(series.Select(item => item.Name)).Concat(error == null ? [] : new[] { "Error" });
        IEnumerable<List<string>> rows = Enumerable.Range(0, 9).Select(i =>
        {
            int sample = i * (Samples - 1) / 8;
            string sampleLabel;
            if (pi)
                sampleLabel = PiLabel((int)Math.Round(xs[sample] / (Math.PI / 8)), 8);
            else
                sampleLabel = xs[sample].ToString("F4", Invariant);

            List<string> row = new List<string> { sampleLabel };
            row.AddRange(series.Select(item => item.Values[sample].ToString("F5", Invariant)));
            if (error != null)
                row.Add(error[sample].ToString("+0.00000;-0.00000;+0.00000", Invariant));
            return row;
        });
        return RenderTable(headers, rows);
    }

    private static string RenderPlot((double[] Values, string Class)[] lines, double[] xs, (double Low, double High) range, int height, (double Value, string Label)[] xTicks)
    {
        double X(double x)
        {
            return (x - xs[0]) / (xs[^1] - xs[0]) * 1000;
        }

        double Y(double y)
        {
            return (range.High - y) / (range.High - range.Low) * height;
        }

        double[] yTicks = Ticks(range.Low, range.High);
        string grid = RenderGrid(yTicks, xTicks, X, Y, height);
        string paths = RenderPaths(lines, xs, X, Y);
        string yLabels = string.Concat(yTicks.Select(t => $"""<span style="top: {N(Y(t) / height * 100)}%">{TickNumber(t)}</span>"""));
        string xLabels = string.Concat(xTicks.Select(t => $"""<span style="left: {N(X(t.Value) / 10)}%">{H(t.Label)}</span>"""));
        return $"""<div class="chart-plot" style="--h: {height}"><div class="chart-y" aria-hidden="true">{yLabels}</div><div class="chart-area"><svg viewBox="0 0 1000 {height}" preserveAspectRatio="none" aria-hidden="true">{grid}{paths}</svg><div class="chart-hover" hidden></div></div><div class="chart-x" aria-hidden="true">{xLabels}</div></div>""";
    }

    private static string RenderGrid(double[] yTicks, (double Value, string Label)[] xTicks, Func<double, double> x, Func<double, double> y, int height)
    {
        StringBuilder grid = new StringBuilder();
        foreach (double tick in yTicks)
        {
            string zero = Math.Abs(tick) < 1e-9 ? " chart-zero" : "";
            string position = N(y(tick));
            grid.Append($"""<line class="chart-grid{zero}" x1="0" x2="1000" y1="{position}" y2="{position}"/>""");
        }

        foreach ((double Value, string Label) tick in xTicks)
        {
            string zero = Math.Abs(tick.Value) < 1e-9 ? " chart-zero" : "";
            string position = N(x(tick.Value));
            grid.Append($"""<line class="chart-grid{zero}" x1="{position}" x2="{position}" y1="0" y2="{height}"/>""");
        }

        return grid.ToString();
    }

    private static string RenderPaths((double[] Values, string Class)[] lines, double[] xs, Func<double, double> x, Func<double, double> y)
    {
        StringBuilder paths = new StringBuilder();
        foreach ((double[] Values, string Class) line in lines)
        {
            StringBuilder points = new StringBuilder();
            for (int i = 0; i < xs.Length; i++)
            {
                if (i > 0)
                    points.Append(' ');
                string command = i == 0 ? "M" : "L";
                points.Append($"{command}{N(x(xs[i]))} {N(y(line.Values[i]))}");
            }

            paths.Append($"""<path class="chart-line {line.Class}" d="{points}"/>""");
        }

        return paths.ToString();
    }

    private static double Number(string expression)
    {
        if (double.TryParse(expression, NumberStyles.Float, Invariant, out double numeric))
            return numeric;
        Match match = ChartNumberExpressionRegex.Match(expression.Trim());
        if (!match.Success)
            throw new InvalidDataException($"Unsupported chart number '{expression}'.");
        string factor = match.Groups["factor"].Value;
        string divisor = match.Groups["divisor"].Value;
        return (match.Groups["sign"].Value == "-" ? -1 : 1)
               * (factor.Length == 0 ? 1 : double.Parse(factor, Invariant))
               * (match.Groups["pi"].Success ? Math.PI : 1)
               / (divisor.Length == 0 ? 1 : double.Parse(divisor, Invariant));
    }

    private static double NiceStep(double span)
    {
        double raw = span / 5;
        double magnitude = Math.Pow(10, Math.Floor(Math.Log10(raw)));
        return new[] { 1, 2, 2.5, 5, 10 }.Select(value => value * magnitude).First(value => value >= raw);
    }

    private static (double Low, double High) NiceRange(IEnumerable<double> values)
    {
        double[] array = values.ToArray();
        double low = array.Min();
        double high = array.Max();
        if (low == high)
        {
            low -= 1;
            high += 1;
        }

        double step = NiceStep(high - low);
        return (Math.Floor(low / step) * step, Math.Ceiling(high / step) * step);
    }

    private static double[] Ticks(double low, double high)
    {
        double step = NiceStep(high - low);
        return Enumerable.Range(0, (int)Math.Round((high - low) / step) + 1).Select(i => Math.Round(low + i * step, 10)).ToArray();
    }

    private static string PiLabel(int numerator, int denominator)
    {
        if (numerator == 0)
            return "0";
        string sign = numerator < 0 ? "−" : "";
        numerator = Math.Abs(numerator);
        int a = numerator;
        int b = denominator;
        while (b != 0)
        {
            (a, b) = (b, a % b);
        }

        numerator /= a;
        denominator /= a;
        return sign + (numerator == 1 ? "" : numerator.ToString(Invariant)) + "π" + (denominator == 1 ? "" : "/" + denominator);
    }

    private static string RenderTable(IEnumerable<string> headers, IEnumerable<IEnumerable<string>> rows)
    {
        StringBuilder headings = new StringBuilder();
        foreach (string header in headers)
        {
            headings.Append($"""<th scope="col">{H(header)}</th>""");
        }

        StringBuilder body = new StringBuilder();
        foreach (IEnumerable<string> row in rows)
        {
            body.Append("<tr>");
            foreach (string value in row)
            {
                body.Append($"""<td>{H(value)}</td>""");
            }
            body.Append("</tr>");
        }

        return $"""<details class="chart-data"><summary>Show data</summary><table><thead><tr>{headings}</tr></thead><tbody>{body}</tbody></table></details>""";
    }

    private static bool Has(YamlMappingNode node, string key)
    {
        return node.Children.ContainsKey(new YamlScalarNode(key));
    }

    private static string Value(YamlMappingNode node, string key, string fallback = "")
    {
        return node.Children.TryGetValue(new YamlScalarNode(key), out YamlNode? value) ? value.ToString() : fallback;
    }

    private static IEnumerable<YamlNode> Sequence(YamlMappingNode node, string key)
    {
        return node.Children.TryGetValue(new YamlScalarNode(key), out YamlNode? value) ? ((YamlSequenceNode)value).Children : [];
    }

    private static string N(double value)
    {
        return Math.Round(value, 2).ToString("0.##", Invariant);
    }

    private static string TickNumber(double value)
    {
        return (Math.Abs(value) < 1e-9 ? "0" : value.ToString("G6", Invariant)).Replace("-", "−", StringComparison.Ordinal);
    }

    private static string H(string value)
    {
        return WebUtility.HtmlEncode(value);
    }
}