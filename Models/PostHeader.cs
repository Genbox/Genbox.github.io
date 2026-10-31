namespace Blog.Models;

public sealed class PostHeader
{
    public required string Title { get; init; }
    public string Description { get; init; } = "";
    public required string Date { get; init; }
    public string? LastModifiedAt { get; init; }
    public required string Permalink { get; init; }
    public string[] Tags { get; init; } = [];
    public string[] Stylesheets { get; init; } = [];
}