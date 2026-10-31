namespace Blog.Models;

public sealed record Repository(string Name, string Url, string? Description, string? Language, int StargazerCount, bool IsArchived, DateTimeOffset PushedAt, int? Pinned);