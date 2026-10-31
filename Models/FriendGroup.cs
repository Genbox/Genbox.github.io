namespace Blog.Models;

public sealed record FriendGroup(string Id, string Title, IReadOnlyList<Friend> Blogs);