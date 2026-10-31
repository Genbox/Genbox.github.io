namespace Blog.Models;

public sealed record ProjectGroup(string Name, IReadOnlyList<Repository> Repos);