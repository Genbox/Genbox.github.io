using System.Text.Json.Serialization;

namespace Blog.Models;

public sealed record ArticleSeries(string Id, string Title, string[] Parts, string? Overview)
{
    [JsonIgnore]
    public Post?[] Articles { get; internal set; } = [];

    [JsonIgnore]
    public Post? OverviewPost { get; internal set; }
}