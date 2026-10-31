namespace Blog.Models;

public sealed record Topic(string Name, string Slug, string Description)
{
    public string Url => $"/topics/{Slug}/";
    public int Count { get; set; }
}