namespace Blog.Models;

public sealed record Friend(string Name, string Url, string? Description, string[] Tags);