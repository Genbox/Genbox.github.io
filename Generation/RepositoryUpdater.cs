using System.Net.Http.Headers;
using System.Text.Json;
using Blog.Models;

namespace Blog.Generation;

public static class RepositoryUpdater
{
    public static async Task RefreshAsync(string root, string token, string login, ILogger logger)
    {
        const string query = """
                             query($login:String!){user(login:$login){
                               pinnedItems(first:6,types:REPOSITORY){nodes{... on Repository{name}}}
                               repositories(first:100,privacy:PUBLIC,ownerAffiliations:OWNER,isFork:false,orderBy:{field:STARGAZERS,direction:DESC}){
                                 nodes{name url description stargazerCount isArchived pushedAt primaryLanguage{name}}}}}
                             """;
        try
        {
            using HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Genbox-Blog/1.0");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            using HttpResponseMessage response = await client.PostAsJsonAsync("https://api.github.com/graphql", new { query, variables = new { login } });
            response.EnsureSuccessStatusCode();
            using JsonDocument json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            if (json.RootElement.TryGetProperty("errors", out _))
                throw new InvalidOperationException("GitHub returned GraphQL errors.");
            JsonElement user = json.RootElement.GetProperty("data").GetProperty("user");
            string[] pinned = user.GetProperty("pinnedItems").GetProperty("nodes").EnumerateArray()
                                  .Select(node => node.GetProperty("name").GetString()!).ToArray();
            Repository[] repositories = user.GetProperty("repositories").GetProperty("nodes").EnumerateArray()
                                            .Where(node => !node.GetProperty("isArchived").GetBoolean()).Select(node =>
                                            {
                                                string name = node.GetProperty("name").GetString()!;
                                                int pin = Array.IndexOf(pinned, name);
                                                JsonElement language = node.GetProperty("primaryLanguage");
                                                return new Repository(name, node.GetProperty("url").GetString()!, node.GetProperty("description").GetString(), language.ValueKind == JsonValueKind.Null ? null : language.GetProperty("name").GetString(), node.GetProperty("stargazerCount").GetInt32(), false, node.GetProperty("pushedAt").GetDateTimeOffset(), pin < 0 ? null : pin);
                                            }).ToArray();
            string file = Path.Combine(root, "_data", "repos.json");
            await File.WriteAllTextAsync(file, JsonSerializer.Serialize(repositories, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true }));
        }
        catch (Exception exception) when (exception is HttpRequestException or JsonException or InvalidOperationException or TaskCanceledException)
        {
            logger.LogWarning("Could not refresh GitHub repositories; using the committed snapshot. {Reason}", exception.Message);
        }
    }
}