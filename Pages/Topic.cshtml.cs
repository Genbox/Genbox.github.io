using Blog.Models;
using Blog.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Blog.Pages;

public sealed class TopicModel(SiteCatalog site) : PageModel
{
    public Topic Topic { get; private set; } = null!;

    public IActionResult OnGet(string slug)
    {
        Topic? topic = site.FindTopic(slug);
        if (topic is null)
            return NotFound();

        Topic = topic;
        return Page();
    }
}